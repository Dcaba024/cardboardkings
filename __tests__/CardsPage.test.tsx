import { render, screen, waitFor } from "@testing-library/react";
import CardsPage from "../app/cards/page";

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
    items: [],
  }),
}));

const mockFetch = (data: unknown) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  } as Response);
};

describe("Cards page", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    addItemMock.mockClear();
  });

  it("shows only active listings", async () => {
    mockFetch([
      {
        id: "active-card",
        title: "Active Card",
        description: "Active listing",
        priceCents: 25000,
        imageUrl: "/active.jpg",
        status: "ACTIVE",
      },
      {
        id: "sold-card",
        title: "Sold Card",
        description: "Sold listing",
        priceCents: 18000,
        imageUrl: "/sold.jpg",
        status: "SOLD",
      },
    ]);

    render(<CardsPage />);

    await waitFor(() => {
      expect(screen.getByText("Active Card")).toBeInTheDocument();
    });
    expect(screen.queryByText("Sold Card")).not.toBeInTheDocument();
  });
});
