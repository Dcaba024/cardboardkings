import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../app/page";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill: _fill, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

const addItemMock = jest.fn();

jest.mock("../app/context/CartContext", () => ({
  useCart: () => ({
    addItem: addItemMock,
  }),
}));

const mockFetch = (data: unknown) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  } as Response);
};

describe("Home page", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    addItemMock.mockClear();
  });

  it("shows empty state when there are no active cards", async () => {
    mockFetch([]);
    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /There are no cards for sale yet but come back and check again later\./i
        )
      ).toBeInTheDocument();
    });
  });

  it("renders a random active card and allows adding to cart", async () => {
    mockFetch([
      {
        id: "card-1",
        title: "Active Card",
        description: "Test card",
        priceCents: 10000,
        imageUrl: "/card.jpg",
        status: "ACTIVE",
      },
      {
        id: "card-2",
        title: "Sold Card",
        description: "Sold card",
        priceCents: 5000,
        imageUrl: "/sold.jpg",
        status: "SOLD",
      },
    ]);

    const { container } = render(<Home />);
    await waitFor(() => {
      expect(screen.getByText("Active Card")).toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: /add to cart/i });
    await userEvent.click(addButton);
    expect(addItemMock).toHaveBeenCalledTimes(1);
    expect(container.querySelector("img")).toBeInTheDocument();
  });
});
