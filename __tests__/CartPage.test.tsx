import { render, screen } from "@testing-library/react";
import CartPage from "../app/cart/page";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill: _fill, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

jest.mock("../app/context/CartContext", () => ({
  useCart: () => ({
    items: [],
    cartCount: 0,
    removeItem: jest.fn(),
    clear: jest.fn(),
  }),
}));

describe("Cart page", () => {
  it("shows empty cart state", () => {
    render(<CartPage />);
    expect(screen.getByText(/Your cart is empty\./i)).toBeInTheDocument();
    expect(screen.getByText(/Continue shopping/i)).toBeInTheDocument();
  });
});
