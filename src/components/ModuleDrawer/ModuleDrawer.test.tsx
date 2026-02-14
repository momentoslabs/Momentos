import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import ModuleDrawer from "./ModuleDrawer";
import { ModuleSize } from "../../utils/types";

jest.mock("./ModuleCard", () => ({ module, onRemove }: any) => (
  <div data-testid="ModuleCard">
    <span>{module.name}</span>
    {onRemove && (
      <button onClick={() => onRemove(module.moduleUrl)}>Remove</button>
    )}
  </div>
));

const modulesMock = [
  {
    id: "1",
    name: "Module A",
    moduleUrl: "url-a",
    size: "1x1" as ModuleSize,
    description: "",
  },
  {
    id: "2",
    name: "Module B",
    moduleUrl: "url-b",
    size: "1x2" as ModuleSize,
    description: "",
  },
];

const myModulesMock = ["url-a"];

const colorsMock = {
  surface: "#fff",
  border: "#ccc",
  text: "#000",
  accent: "#007bff",
  error: "#ff0000",
  gridBackground: "#eee",
};

describe("ModuleDrawer", () => {
  it("renders without crashing when open", () => {
    render(
      <ModuleDrawer
        open={true}
        tab="my"
        setTab={() => {}}
        modules={modulesMock}
        myModules={myModulesMock}
        onDragStart={() => {}}
        onLoadFromFile={() => {}}
        onSaveToFile={() => {}}
        onClearGrid={() => {}}
        onClose={() => {}}
        onAddModule={() => {}}
        onRemoveModule={() => {}}
        customColors={colorsMock}
      />,
    );

    expect(screen.getByTestId("ModuleDrawer")).toBeInTheDocument();
    expect(screen.getAllByTestId("ModuleCard").length).toBe(1);
    expect(screen.getByText("Module A")).toBeInTheDocument();
  });

  it("switches tabs correctly", () => {
    const setTabMock = jest.fn();

    render(
      <ModuleDrawer
        open={true}
        tab="my"
        setTab={setTabMock}
        modules={modulesMock}
        myModules={myModulesMock}
        onDragStart={() => {}}
        onLoadFromFile={() => {}}
        onSaveToFile={() => {}}
        onClearGrid={() => {}}
        onClose={() => {}}
        onAddModule={() => {}}
        onRemoveModule={() => {}}
        customColors={colorsMock}
      />,
    );

    fireEvent.click(screen.getByText("Browse"));
    expect(setTabMock).toHaveBeenCalledWith("browse");
  });

  it("adds a custom module with confirmation if unverified", () => {
    const onAddModuleMock = jest.fn();

    window.confirm = jest.fn(() => true);
    window.confirm = jest.fn(() => true);

    render(
      <ModuleDrawer
        open={true}
        tab="browse"
        setTab={() => {}}
        modules={modulesMock}
        myModules={[]}
        onDragStart={() => {}}
        onLoadFromFile={() => {}}
        onSaveToFile={() => {}}
        onClearGrid={() => {}}
        onClose={() => {}}
        onAddModule={onAddModuleMock}
        onRemoveModule={() => {}}
        customColors={colorsMock}
      />,
    );

    const input = screen.getByPlaceholderText("Paste module URL...");
    fireEvent.change(input, { target: { value: "url-new" } });

    const addButton = screen.getByText("+ Add");
    fireEvent.click(addButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(onAddModuleMock).toHaveBeenCalledWith("url-new");
  });

  it("renders 'No modules found' in browse tab when filtered empty", () => {
    render(
      <ModuleDrawer
        open={true}
        tab="browse"
        setTab={() => {}}
        modules={modulesMock}
        myModules={[]}
        onDragStart={() => {}}
        onLoadFromFile={() => {}}
        onSaveToFile={() => {}}
        onClearGrid={() => {}}
        onClose={() => {}}
        onAddModule={() => {}}
        onRemoveModule={() => {}}
        customColors={colorsMock}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Browse modules...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(screen.getByText("No modules found")).toBeInTheDocument();
  });

  it("removes a module from myModules", () => {
    const onRemoveModuleMock = jest.fn();

    render(
      <ModuleDrawer
        open={true}
        tab="my"
        setTab={() => {}}
        modules={modulesMock}
        myModules={myModulesMock}
        onDragStart={() => {}}
        onLoadFromFile={() => {}}
        onSaveToFile={() => {}}
        onClearGrid={() => {}}
        onClose={() => {}}
        onAddModule={() => {}}
        onRemoveModule={onRemoveModuleMock}
        customColors={colorsMock}
      />,
    );

    const removeBtn = screen
      .getByText("Module A")
      .closest("div")
      ?.querySelector("button");
    if (removeBtn) fireEvent.click(removeBtn);

    expect(onRemoveModuleMock).toHaveBeenCalledWith("url-a");
  });
});
