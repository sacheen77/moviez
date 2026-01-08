import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios");

describe("Home Page", () => {
  it("renders movie list", async () => {
    axios.get.mockResolvedValue({
      data: [
        {
          id: 1,
          title: "Inception",
          genre: "Sci-Fi",
          rating: 8.8,
          year: 2010
        }
      ]
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(await screen.findByText("Inception")).toBeInTheDocument();
  });
});
