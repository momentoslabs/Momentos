import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";

jest.mock("../ModuleContent/ModuleContent", () => ({
  __esModule: true,
  default: (props: any) => {
    const label =
      props?.data?.label ??
      props?.label ??
      props?.module?.data?.label ??
      props?.module?.label ??
      null;

    return <div data-testid="ModuleContent">{label}</div>;
  },
}));

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

import Grid from "./Grid";
import { PlacedModule } from "../../utils/types";

const mockModules: PlacedModule[] = [
  {
    id: "mod1",
    position: { x: 0, y: 0 },
    style: {},
    data: {
      size: "1x1",
      html: "<p>Module 1</p>",
      js: "",
      label: "Module 1",
      moduleUrl: "url-a",
      links: [{ label: "Link 1", url: "https://example.com" }],
      thematicOverride: false,
    },
  },
  {
    id: "mod2",
    position: { x: 120, y: 0 },
    style: {},
    data: {
      size: "1x2",
      html: "<p>Module 2</p>",
      js: "",
      label: "Module 2",
      moduleUrl: "url-b",
      links: [],
      thematicOverride: true,
    },
  },
];

describe("<Grid />", () => {
  const onDropModule = jest.fn();
  const onMoveModule = jest.fn();
  const onRemoveModule = jest.fn();
  const onCellSizeChange = jest.fn();
  const onDragStart = jest.fn();
  const onDragEnd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing", () => {
    render(
      <Grid
        active={true}
        modules={mockModules}
        onDropModule={onDropModule}
        onMoveModule={onMoveModule}
        onRemoveModule={onRemoveModule}
        onCellSizeChange={onCellSizeChange}
        gridCols={8}
        gridRows={4}
      />,
    );

    expect(screen.getByTestId("Grid")).toBeInTheDocument();
    expect(onCellSizeChange).toHaveBeenCalledWith(120);
  });

  test("renders all modules", () => {
    render(
      <Grid
        active={true}
        modules={mockModules}
        onDropModule={onDropModule}
        onMoveModule={onMoveModule}
        onRemoveModule={onRemoveModule}
        onCellSizeChange={onCellSizeChange}
        gridCols={8}
        gridRows={4}
      />,
    );

    expect(screen.getByText("Module 1")).toBeInTheDocument();
    expect(screen.getByText("Module 2")).toBeInTheDocument();
  });

  test("selects a module on click", () => {
    render(
      <Grid
        active={true}
        modules={mockModules}
        onDropModule={onDropModule}
        onMoveModule={onMoveModule}
        onRemoveModule={onRemoveModule}
        onCellSizeChange={onCellSizeChange}
        gridCols={8}
        gridRows={4}
      />,
    );

    const moduleWrappers = screen
      .getAllByTestId("ModuleContent")
      .map((el) => el.closest("div")?.parentElement);

    const firstWrapper = moduleWrappers[0] as HTMLElement;

    fireEvent.click(firstWrapper);
    expect(firstWrapper.style.boxShadow).not.toBe("none");
  });

  test("opens menu and removes module", () => {
    jest.useFakeTimers();
    render(
      <Grid
        active={true}
        modules={mockModules}
        onDropModule={onDropModule}
        onMoveModule={onMoveModule}
        onRemoveModule={onRemoveModule}
        onCellSizeChange={onCellSizeChange}
        gridCols={8}
        gridRows={4}
      />,
    );

    const menuIcon = screen.getAllByTitle(
      "Click for menu, long press to drag",
    )[0];

    fireEvent.click(menuIcon);

    expect(screen.getByText("Remove")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Remove"));

    // Wait for poof animation timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onRemoveModule).toHaveBeenCalledWith("mod1");
    jest.useRealTimers();
  });

  test("handles drag start on long press", () => {
    jest.useFakeTimers();

    render(
      <Grid
        active={true}
        modules={mockModules}
        onDropModule={onDropModule}
        onMoveModule={onMoveModule}
        onRemoveModule={onRemoveModule}
        onCellSizeChange={onCellSizeChange}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        gridCols={8}
        gridRows={4}
      />,
    );

    const menuIcon = screen.getAllByTitle(
      "Click for menu, long press to drag",
    )[0];

    fireEvent.mouseDown(menuIcon);

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(onDragStart).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockModules[0].data,
        fromGrid: expect.objectContaining({ id: "mod1" }),
      }),
    );

    fireEvent.mouseUp(menuIcon);

    jest.useRealTimers();
  });
});
