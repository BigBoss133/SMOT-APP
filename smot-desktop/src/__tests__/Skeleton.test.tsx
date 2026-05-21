import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Skeleton from "../components/Skeleton";

describe("Skeleton", () => {
  it("renders a text skeleton by default", () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId(/skeleton-text/);
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("skeleton-pulse");
  });

  it("renders a rect skeleton", () => {
    render(<Skeleton variant="rect" />);
    const skeleton = screen.getByTestId(/skeleton-rect/);
    expect(skeleton).toBeInTheDocument();
  });

  it("renders a circle skeleton", () => {
    render(<Skeleton variant="circle" />);
    const skeleton = screen.getByTestId(/skeleton-circle/);
    expect(skeleton).toBeInTheDocument();
  });

  it("applies custom width and height", () => {
    render(<Skeleton width={100} height={50} />);
    const skeleton = screen.getByTestId(/skeleton-text/);
    expect(skeleton).toHaveStyle({ width: "100px", height: "50px" });
  });
});
