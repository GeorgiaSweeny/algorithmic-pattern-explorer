import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EvaluationOverlay from "./EvaluationOverlay.jsx";
import { STUDY1_STORAGE_KEY } from "./evaluationStorage.js";

beforeEach(() => {
   localStorage.removeItem(STUDY1_STORAGE_KEY);
});

// Answers every fieldset's first radio option — Study 1's question bank is
// entirely plain "mc" (no images/multi-select), so this is enough to make
// every question "answered" and enable Submit.
function answerEveryQuestion() {
   const fieldsets = document.querySelectorAll(".eval-question");
   fieldsets.forEach((fieldset) => {
      fireEvent.click(fieldset.querySelector('input[type="radio"]'));
   });
}

function takeQuiz(takeButtonText) {
   fireEvent.click(screen.getByText(takeButtonText));
   answerEveryQuestion();
   fireEvent.click(screen.getByRole("button", { name: "Submit" }));
}

describe("EvaluationOverlay: pre/post stored-results indicators", () => {
   it("shows both phases as not stored on first open, before any quiz is taken", () => {
      render(<EvaluationOverlay onClose={() => {}} study={1} />);
      expect(screen.getByText("Pre-quiz not stored")).toBeInTheDocument();
      expect(screen.getByText("Post-quiz not stored")).toBeInTheDocument();
   });

   it("marks only the pre-quiz as stored after submitting a pre-quiz pass", () => {
      render(<EvaluationOverlay onClose={() => {}} study={1} />);
      takeQuiz("Take Pre-Quiz");

      // Now on the post-submit summary screen.
      expect(screen.getByText("Pre-quiz stored")).toBeInTheDocument();
      expect(screen.getByText("Post-quiz not stored")).toBeInTheDocument();
   });

   it("marks only the post-quiz as stored after submitting a post-quiz pass", () => {
      render(<EvaluationOverlay onClose={() => {}} study={1} />);
      takeQuiz("Take Post-Quiz");

      expect(screen.getByText("Pre-quiz not stored")).toBeInTheDocument();
      expect(screen.getByText("Post-quiz stored")).toBeInTheDocument();
   });

   it("shows both phases stored once both a pre- and a post-quiz pass are submitted", () => {
      render(<EvaluationOverlay onClose={() => {}} study={1} />);
      takeQuiz("Take Pre-Quiz");
      fireEvent.click(screen.getByRole("button", { name: "Back" }));
      takeQuiz("Take Post-Quiz");

      expect(screen.getByText("Pre-quiz stored")).toBeInTheDocument();
      expect(screen.getByText("Post-quiz stored")).toBeInTheDocument();
   });

   it("keeps showing stored status back on the intro screen after a submitted pass", () => {
      render(<EvaluationOverlay onClose={() => {}} study={1} />);
      takeQuiz("Take Pre-Quiz");
      fireEvent.click(screen.getByRole("button", { name: "Back" }));

      expect(screen.getByText("Pre-quiz stored")).toBeInTheDocument();
      expect(screen.getByText("Post-quiz not stored")).toBeInTheDocument();
   });

   it("reverts both phases to not-stored immediately after Clear Stored Responses", () => {
      render(<EvaluationOverlay onClose={() => {}} study={1} />);
      takeQuiz("Take Pre-Quiz");
      fireEvent.click(screen.getByRole("button", { name: "Back" }));
      takeQuiz("Take Post-Quiz");
      fireEvent.click(screen.getByRole("button", { name: "Back" }));
      expect(screen.getByText("Pre-quiz stored")).toBeInTheDocument();
      expect(screen.getByText("Post-quiz stored")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Clear Stored Responses" }));
      expect(screen.getByText("Pre-quiz not stored")).toBeInTheDocument();
      expect(screen.getByText("Post-quiz not stored")).toBeInTheDocument();
   });

   it("reflects a phase already stored from a previous session when the overlay is (re)opened", () => {
      // Simulates reopening the overlay in a later session, without going
      // through the UI flow that wrote it.
      localStorage.setItem(
         STUDY1_STORAGE_KEY,
         JSON.stringify([{ type: "quiz", phase: "pre", score: 1, total: 1, items: [] }])
      );
      render(<EvaluationOverlay onClose={() => {}} study={1} />);
      expect(screen.getByText("Pre-quiz stored")).toBeInTheDocument();
      expect(screen.getByText("Post-quiz not stored")).toBeInTheDocument();
   });
});

describe("EvaluationOverlay: 'cleared' confirmation message", () => {
   it("shows no confirmation message before Clear Stored Responses is ever clicked", () => {
      render(<EvaluationOverlay onClose={() => {}} study={1} />);
      expect(screen.queryByText(/successfully cleared/i)).not.toBeInTheDocument();
   });

   it("shows a 'successfully cleared' confirmation right after Clear Stored Responses is clicked", () => {
      render(<EvaluationOverlay onClose={() => {}} study={1} />);
      takeQuiz("Take Pre-Quiz");
      fireEvent.click(screen.getByRole("button", { name: "Back" }));

      fireEvent.click(screen.getByRole("button", { name: "Clear Stored Responses" }));
      expect(screen.getByText(/successfully cleared/i)).toBeInTheDocument();
      // Alongside the dots updating, not instead of them.
      expect(screen.getByText("Pre-quiz not stored")).toBeInTheDocument();
      expect(screen.getByText("Post-quiz not stored")).toBeInTheDocument();
   });

   it("shows the confirmation even when there was nothing to clear", () => {
      render(<EvaluationOverlay onClose={() => {}} study={1} />);
      fireEvent.click(screen.getByRole("button", { name: "Clear Stored Responses" }));
      expect(screen.getByText(/successfully cleared/i)).toBeInTheDocument();
   });

   it("hides the confirmation again once the user starts a new quiz pass", () => {
      render(<EvaluationOverlay onClose={() => {}} study={1} />);
      fireEvent.click(screen.getByRole("button", { name: "Clear Stored Responses" }));
      expect(screen.getByText(/successfully cleared/i)).toBeInTheDocument();

      takeQuiz("Take Pre-Quiz");
      fireEvent.click(screen.getByRole("button", { name: "Back" }));
      expect(screen.queryByText(/successfully cleared/i)).not.toBeInTheDocument();
   });
});
