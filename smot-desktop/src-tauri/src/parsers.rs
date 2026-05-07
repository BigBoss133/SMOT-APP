use docx_rust::DocxFile;
use serde::Serialize;
use std::path::{Path, PathBuf};

#[derive(Serialize)]
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
