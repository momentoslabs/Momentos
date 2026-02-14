import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import ModuleCard from "./ModuleCard";
import { ModuleSize } from "../../utils/types";

const moduleMock = {
  id: "1234567890",
  name: "Test Module Name That Is Really Long To Trigger Truncate",
  description:
    "This is a long module description that should be truncated initially and then expanded when clicking Read more.",
  size: "1x1" as ModuleSize,
  previewImg: "https://via.placeholder.com/150",
};

const customColorsMock = {
  surface: "#fff",
  border: "#ccc",
  gridBackground: "#eee",
  text: "#000",
  accent: "#007bff",
  error: "#ff0000",
};

describe("ModuleCard", () => {
  it("renders without crashing", () => {
    render(
      <ModuleCard
        module={moduleMock}
        onDragStart={() => {}}
        onRemove={() => {}}
        onAdd={() => {}}
        showAddButton={false}
        customColors={customColorsMock}
      />,
    );
    expect(screen.getByTestId("ModuleCard")).toBeInTheDocument();
  });

  it("displays truncated name and description", () => {
    render(
      <ModuleCard
        module={moduleMock}
        onDragStart={() => {}}
        onRemove={() => {}}
        onAdd={() => {}}
        showAddButton={false}
        customColors={customColorsMock}
      />,
    );

    expect(
      screen.getByText(/Test Module Name That Is Really/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /This is a long module description that should be truncated/i,
      ),
    ).toBeInTheDocument();
  });

  it("expands full name when Read more is clicked", () => {
    render(
      <ModuleCard
        module={moduleMock}
        onDragStart={() => {}}
        onRemove={() => {}}
        onAdd={() => {}}
        showAddButton={false}
        customColors={customColorsMock}
      />,
    );

    const [nameButton] = screen.getAllByRole("button", { name: /Read more/i });
    fireEvent.click(nameButton);

    expect(screen.getByText(moduleMock.name)).toBeInTheDocument();
  });

  it("expands full description when Read more is clicked", () => {
    render(
      <ModuleCard
        module={moduleMock}
        onDragStart={() => {}}
        onRemove={() => {}}
        onAdd={() => {}}
        showAddButton={false}
        customColors={customColorsMock}
      />,
    );

    const [, descButton] = screen.getAllByRole("button", {
      name: /Read more/i,
    });
    fireEvent.click(descButton);

    expect(screen.getByText(moduleMock.description)).toBeInTheDocument();
  });

  it("calls onRemove when trash icon is clicked", () => {
    const onRemoveMock = jest.fn();

    render(
      <ModuleCard
        module={moduleMock}
        onDragStart={() => {}}
        onRemove={onRemoveMock}
        onAdd={() => {}}
        showAddButton={false}
        customColors={customColorsMock}
      />,
    );

    const trashIcon = screen.getByTestId("Icon");
    fireEvent.click(trashIcon);

    expect(onRemoveMock).toHaveBeenCalled();
  });

  it("shows Add button and calls onAdd when clicked", () => {
    const onAddMock = jest.fn();

    render(
      <ModuleCard
        module={moduleMock}
        onDragStart={() => {}}
        onRemove={() => {}}
        onAdd={onAddMock}
        showAddButton={true}
        customColors={customColorsMock}
      />,
    );

    const addButton = screen.getByText("+ Add");
    fireEvent.click(addButton);

    expect(onAddMock).toHaveBeenCalled();
  });

  it("renders the module preview image", () => {
    render(
      <ModuleCard
        module={moduleMock}
        onDragStart={() => {}}
        onRemove={() => {}}
        onAdd={() => {}}
        showAddButton={false}
        customColors={customColorsMock}
      />,
    );

    const img = screen.getByAltText("Module preview") as HTMLImageElement;
    expect(img.src).toBe(moduleMock.previewImg);
  });

  it("uses fallback preview image (📦 icon) if none provided", () => {
    render(
      <ModuleCard
        module={{ ...moduleMock, previewImg: undefined }}
        onDragStart={() => {}}
        onRemove={() => {}}
        onAdd={() => {}}
        showAddButton={false}
        customColors={customColorsMock}
      />,
    );

    const fallbackIcon = screen.getByTitle("No preview");
    expect(fallbackIcon).toBeInTheDocument();
  });
});
