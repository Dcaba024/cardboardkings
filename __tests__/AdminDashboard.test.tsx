import { render, screen, waitFor } from "@testing-library/react";
import AdminDashboard from "../app/admin/AdminDashboard";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill: _fill, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

const mockFetch = (data: unknown) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  } as Response);
};

describe("Admin dashboard", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    global.URL.createObjectURL = jest.fn(() => "blob:preview");
    global.URL.revokeObjectURL = jest.fn();
  });

  it("separates active and sold listings", async () => {
    mockFetch([
      {
        id: "active-1",
        title: "Active Card",
        description: "Active listing",
        priceCents: 11000,
        imageUrl: "/active.jpg",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      },
      {
        id: "sold-1",
        title: "Sold Card",
        description: "Sold listing",
        priceCents: 9000,
        imageUrl: "/sold.jpg",
        status: "SOLD",
        createdAt: new Date().toISOString(),
      },
    ]);

    render(<AdminDashboard />);

    expect(await screen.findByText("Active Card")).toBeInTheDocument();
    expect(screen.getByText("Sold Card")).toBeInTheDocument();
  });
});
