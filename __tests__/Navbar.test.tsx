import { render, screen, fireEvent, within } from "@testing-library/react";

jest.mock("next/link", () => {
  return ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
});

jest.mock("@clerk/nextjs", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  UserButton: () => <div data-testid="user-button" />,
  useAuth: () => ({ orgRole: null }),
}));

jest.mock("../app/context/CartContext", () => ({
  useCart: () => ({ cartCount: 0 }),
}));

import Navbar from "../app/components/Navbar";

describe("Navbar", () => {
  it("closes the mobile menu when a link is clicked", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByText("☰"));
    const menu = screen.getByTestId("mobile-menu");
    expect(menu.className).toContain("block");
    const link = within(menu).getByText("Cards for sale");
    fireEvent.click(link);
    expect(menu.className).toContain("hidden");
  });

  it("closes the mobile menu when clicking outside", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByText("☰"));
    const menu = screen.getByTestId("mobile-menu");
    expect(menu.className).toContain("block");
    fireEvent.mouseDown(document.body);
    expect(menu.className).toContain("hidden");
  });

  it("closes the mobile menu on Escape", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByText("☰"));
    const menu = screen.getByTestId("mobile-menu");
    expect(menu.className).toContain("block");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(menu.className).toContain("hidden");
  });
});
