use docx_rust::DocxFile;
use serde::Serialize;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize)]
pub struct ParsedDocumentOutput {
    pub file_path: String,
    pub file_type: String,
    pub text: String,
    pub page_count: Option<usize>,
    pub fallback_needed: bool,
    pub fallback_reason: Option<String>,
}

pub fn extract_document_text(path: PathBuf) -> Result<ParsedDocumentOutput, String> {
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.to_lowercase())
        .ok_or_else(|| "Estensione file non riconosciuta".to_string())?;

    match extension.as_str() {
        "pdf" => extract_pdf(path.as_path()),
        "docx" => extract_docx(path.as_path()),
        "xlsx" => extract_xlsx(path.as_path()),
        "txt" => extract_txt(path.as_path()),
        _ => Err(format!("Formato non supportato dal parser: {}", extension)),
    }
}

fn extract_pdf(path: &Path) -> Result<ParsedDocumentOutput, String> {
    let pages = pdf_extract::extract_text_by_pages(path)
        .map_err(|error| format!("Errore parser PDF (by pages): {error}"))?;
    let merged_text = pages.join("\n\n");
    let trimmed = merged_text.trim().to_string();

    if trimmed.is_empty() {
        return Ok(ParsedDocumentOutput {
            file_path: path.display().to_string(),
            file_type: "pdf".to_string(),
            text: String::new(),
            page_count: Some(pages.len()),
            fallback_needed: true,
            fallback_reason: Some(
                "PDF senza testo selezionabile: attivare OCR fallback nel prossimo step."
                    .to_string(),
            ),
        });
    }

    Ok(ParsedDocumentOutput {
        file_path: path.display().to_string(),
        file_type: "pdf".to_string(),
        text: trimmed,
        page_count: Some(pages.len()),
        fallback_needed: false,
        fallback_reason: None,
    })
}

fn extract_docx(path: &Path) -> Result<ParsedDocumentOutput, String> {
    let docx_file =
        DocxFile::from_file(path).map_err(|error| format!("Errore apertura DOCX: {error}"))?;
    let parsed = docx_file
        .parse()
        .map_err(|error| format!("Errore parser DOCX: {error}"))?;
    let text = parsed.document.body.text().trim().to_string();

    Ok(ParsedDocumentOutput {
        file_path: path.display().to_string(),
        file_type: "docx".to_string(),
        text,
        page_count: None,
        fallback_needed: false,
        fallback_reason: None,
    })
}

fn extract_txt(path: &Path) -> Result<ParsedDocumentOutput, String> {
    let text =
        std::fs::read_to_string(path).map_err(|error| format!("Errore lettura TXT: {error}"))?;

    Ok(ParsedDocumentOutput {
        file_path: path.display().to_string(),
        file_type: "txt".to_string(),
        text: text.trim().to_string(),
        page_count: None,
        fallback_needed: false,
        fallback_reason: None,
    })
}

fn extract_xlsx(path: &Path) -> Result<ParsedDocumentOutput, String> {
    use calamine::{open_workbook, Reader, Xlsx};

    let mut workbook: Xlsx<_> =
        open_workbook(path).map_err(|error| format!("Errore apertura XLSX: {error}"))?;

    let mut all_text = Vec::new();
    let mut sheet_count = 0;

    for sheet_name in workbook.sheet_names().to_owned() {
        sheet_count += 1;
        if let Ok(range) = workbook.worksheet_range(&sheet_name) {
            let mut sheet_text = format!("=== Sheet: {} ===\n", sheet_name);

            for row in range.rows() {
                let row_values: Vec<String> = row
                    .iter()
                    .map(|cell| cell.to_string())
                    .filter(|s| !s.is_empty())
                    .collect();

                if !row_values.is_empty() {
                    sheet_text.push_str(&row_values.join("\t"));
                    sheet_text.push('\n');
                }
            }

            all_text.push(sheet_text);
        }
    }

    let merged_text = all_text.join("\n").trim().to_string();

    if merged_text.is_empty() {
        return Ok(ParsedDocumentOutput {
            file_path: path.display().to_string(),
            file_type: "xlsx".to_string(),
            text: String::new(),
            page_count: Some(sheet_count),
            fallback_needed: true,
            fallback_reason: Some("File XLSX vuoto o senza dati leggibili.".to_string()),
        });
    }

    Ok(ParsedDocumentOutput {
        file_path: path.display().to_string(),
        file_type: "xlsx".to_string(),
        text: merged_text,
        page_count: Some(sheet_count),
        fallback_needed: false,
        fallback_reason: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    fn create_temp_txt(content: &str, suffix: &str) -> PathBuf {
        let dir = std::env::temp_dir().join("smot_test_parsers");
        fs::create_dir_all(&dir).unwrap();
        let path = dir.join(format!("test_{}_{}.txt", std::process::id(), suffix));
        fs::write(&path, content).unwrap();
        path
    }

    #[test]
    fn test_extract_txt_happy_path() {
        let path = create_temp_txt("Hello SMOT world", "happy");
        let result = extract_document_text(path.clone());
        assert!(result.is_ok());
        let doc = result.unwrap();
        assert_eq!(doc.file_type, "txt");
        assert_eq!(doc.text, "Hello SMOT world");
        assert!(!doc.fallback_needed);
        assert!(doc.fallback_reason.is_none());
        let _ = fs::remove_file(&path);
    }

    #[test]
    fn test_extract_txt_empty_file() {
        let path = create_temp_txt("", "empty");
        let result = extract_document_text(path.clone());
        assert!(result.is_ok());
        let doc = result.unwrap();
        assert_eq!(doc.text, "");
        let _ = fs::remove_file(&path);
    }

    #[test]
    fn test_extract_txt_whitespace_only() {
        let path = create_temp_txt("   \n\n  \t  ", "ws");
        let result = extract_document_text(path.clone());
        assert!(result.is_ok());
        let doc = result.unwrap();
        assert_eq!(doc.text, "");
        let _ = fs::remove_file(&path);
    }

    #[test]
    fn test_extract_nonexistent_path() {
        let path = PathBuf::from("/tmp/smot_nonexistent_99999.txt");
        let result = extract_document_text(path);
        assert!(result.is_err());
    }

    #[test]
    fn test_extract_unsupported_extension() {
        let dir = std::env::temp_dir().join("smot_test_parsers");
        fs::create_dir_all(&dir).unwrap();
        let path = dir.join(format!("test_{}.xyz", std::process::id()));
        fs::write(&path, "data").unwrap();
        let result = extract_document_text(path.clone());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Formato non supportato"));
        let _ = fs::remove_file(&path);
    }

    #[test]
    fn test_extract_no_extension() {
        let dir = std::env::temp_dir().join("smot_test_parsers");
        fs::create_dir_all(&dir).unwrap();
        let path = dir.join(format!("noext_{}", std::process::id()));
        fs::write(&path, "data").unwrap();
        let result = extract_document_text(path.clone());
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("Estensione file non riconosciuta"));
        let _ = fs::remove_file(&path);
    }

    #[test]
    fn test_parsed_document_output_fields() {
        let path = create_temp_txt("Test content here", "fields");
        let result = extract_document_text(path.clone());
        let doc = result.unwrap();
        assert!(doc.file_path.ends_with(".txt"));
        assert_eq!(doc.page_count, None);
        assert!(!doc.fallback_needed);
        let _ = fs::remove_file(&path);
    }
}
