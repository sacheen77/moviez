import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "../App";

describe("Routing", () => {
  it("renders home route", () => {
    window.history.pushState({}, "", "/");

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText("Movie Collection")).toBeInTheDocument();
  });
});
