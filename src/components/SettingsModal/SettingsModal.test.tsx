import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("../../utils/colors", () => {
  const actual = jest.requireActual("../../utils/colors");

  return {
    __esModule: true,
    ...actual,
    getThemeColors: () => ({
      background: "#ffffff",
      surface: "#f0f0f0",
      border: "#cccccc",
      primaryBorder: "#cccccc",
      secondaryBorder: "#cccccc",
      gridBackground: "#eeeeee",
      gridLine: "#cccccc",
      text: "#000000",
      accent: "#ff0000",
      primary: "#ff0000",
      success: "#4ade80",
      error: "#f87171",
      isLight: true,
    }),
  };
});

import SettingsModal from "./SettingsModal";

jest.mock(
  "../../graphics/branding/wordmarkblack.svg",
  () => "wordmarkBlack.svg",
);
jest.mock(
  "../../graphics/branding/wordmarkwhite.svg",
  () => "wordmarkWhite.svg",
);

jest.mock("../Icon/Icon", () => ({ name, onClick }: any) => (
  <div data-testid={`icon-${name}`} onClick={onClick} />
));

describe("SettingsModal component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    customColors: {
      background: "#ffffff",
      primaryBorder: "#000000",
      secondaryBorder: "#111111",
      gridBackground: "#222222",
      success: "#4ade80",
      error: "#f87171",
      accent: "#ff0000",
    },
    onCustomColorsChange: jest.fn(),
    showScrollbars: false,
    onShowScrollbarsChange: jest.fn(),
    selectedEngine: "google" as const,
    onSelectedEngineChange: jest.fn(),
    initialTab: "Interface" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal when isOpen is true", () => {
    render(<SettingsModal {...defaultProps} />);
    expect(screen.getByTestId("SettingsModal")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("does not render modal when isOpen is false", () => {
    render(<SettingsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("SettingsModal")).toBeNull();
  });

  it("calls onClose when backdrop is clicked", () => {
    render(<SettingsModal {...defaultProps} />);
    const backdrop = screen.getByTestId("SettingsModal");
    fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("does not call onClose when modal content is clicked", () => {
    render(<SettingsModal {...defaultProps} />);
    const modalContent = screen.getByText("Customize your theme and colors");
    fireEvent.click(modalContent);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it("switches tabs when tab buttons are clicked", () => {
    render(<SettingsModal {...defaultProps} />);

    const searchTab = screen.getByText("Search");
    fireEvent.click(searchTab);
    expect(
      screen.getByText("Select your preferred search engine or platform"),
    ).toBeInTheDocument();

    const aboutTab = screen.getByText("About");
    fireEvent.click(aboutTab);
    expect(
      screen.getByText("Take back your browser's start page."),
    ).toBeInTheDocument();
  });

  it("calls onCustomColorsChange when preset buttons are clicked", () => {
    render(<SettingsModal {...defaultProps} />);

    const lightButton = screen.getByText("Light");
    fireEvent.click(lightButton);
    expect(defaultProps.onCustomColorsChange).toHaveBeenCalled();

    const darkButton = screen.getByText("Dark");
    fireEvent.click(darkButton);
    expect(defaultProps.onCustomColorsChange).toHaveBeenCalled();
  });

  it("calls onCustomColorsChange when color inputs are changed", () => {
    render(<SettingsModal {...defaultProps} />);

    const colorInputs = screen.getAllByDisplayValue("#ffffff");
    if (colorInputs.length > 0) {
      const backgroundColorInput = colorInputs[0];
      fireEvent.change(backgroundColorInput, { target: { value: "#123456" } });

      expect(defaultProps.onCustomColorsChange).toHaveBeenCalledWith(
        expect.objectContaining({ background: "#123456" }),
      );
    } else {
      throw new Error("Color input not found.");
    }
  });

  it("calls onShowScrollbarsChange when checkbox is toggled", () => {
    render(<SettingsModal {...defaultProps} />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(defaultProps.onShowScrollbarsChange).toHaveBeenCalledWith(true);
  });

  it("calls onSelectedEngineChange when a search engine is clicked", () => {
    render(<SettingsModal {...defaultProps} />);
    const searchTab = screen.getByText("Search");
    fireEvent.click(searchTab);

    const googleEngine = screen.getByAltText("Google");
    fireEvent.click(googleEngine);
    expect(defaultProps.onSelectedEngineChange).toHaveBeenCalledWith("google");
  });
});
