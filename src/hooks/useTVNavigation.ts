import { useEffect, useRef, useState, useCallback } from "react";

interface TVNavigationConfig {
  enableArrowKeys?: boolean;
  enableEnterSelect?: boolean;
  enableBackButton?: boolean;
  autoFocus?: boolean;
  focusableSelector?: string;
  onNavigate?: (
    direction: "up" | "down" | "left" | "right" | "enter" | "back",
  ) => void;
}

interface TVNavigationReturn {
  focusedElement: HTMLElement | null;
  focusNext: () => void;
  focusPrevious: () => void;
  focusUp: () => void;
  focusDown: () => void;
  focusLeft: () => void;
  focusRight: () => void;
  selectCurrent: () => void;
  setFocusedElement: (element: HTMLElement | null) => void;
  isTVMode: boolean;
}

export const useTVNavigation = (
  config: TVNavigationConfig = {},
): TVNavigationReturn => {
  const {
    enableArrowKeys = true,
    enableEnterSelect = true,
    enableBackButton = true,
    autoFocus = true,
    focusableSelector = '[data-tv-focusable], button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    onNavigate,
  } = config;

  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(
    null,
  );
  const [isTVMode, setIsTVMode] = useState(false);
  const focusedElementRef = useRef<HTMLElement | null>(null);

  // Detect TV mode
  useEffect(() => {
    const detectTVMode = () => {
      const isLargeScreen = window.innerWidth >= 1280;
      const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const isTV = window.matchMedia("tv").matches;
      const userAgent = navigator.userAgent.toLowerCase();
      const isTVUserAgent = /tv|webos|tizen|roku|chromecast|android tv/i.test(
        userAgent,
      );

      const tvMode =
        isTV ||
        isTVUserAgent ||
        (isLargeScreen && isCoarsePointer) ||
        window.location.search.includes("source=tv") ||
        localStorage.getItem("flickpick-tv-mode") === "true";

      setIsTVMode(tvMode);

      if (tvMode) {
        document.body.classList.add("tv-mode");
        localStorage.setItem("flickpick-tv-mode", "true");
      } else {
        document.body.classList.remove("tv-mode");
      }
    };

    detectTVMode();
    window.addEventListener("resize", detectTVMode);

    return () => window.removeEventListener("resize", detectTVMode);
  }, []);

  // Get all focusable elements
  const getFocusableElements = useCallback((): HTMLElement[] => {
    const elements = Array.from(
      document.querySelectorAll(focusableSelector),
    ) as HTMLElement[];
    return elements.filter((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        !el.hasAttribute("disabled") &&
        el.tabIndex !== -1
      );
    });
  }, [focusableSelector]);

  // Focus element with visual feedback
  const focusElement = useCallback((element: HTMLElement | null) => {
    if (focusedElementRef.current) {
      focusedElementRef.current.classList.remove("focused");
    }

    if (element) {
      element.focus();
      element.classList.add("focused");
      focusedElementRef.current = element;
      setFocusedElement(element);

      // Scroll into view
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    } else {
      focusedElementRef.current = null;
      setFocusedElement(null);
    }
  }, []);

  // Navigation functions
  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const currentIndex = focusedElement ? elements.indexOf(focusedElement) : -1;
    const nextIndex = (currentIndex + 1) % elements.length;
    focusElement(elements[nextIndex]);
    onNavigate?.("down");
  }, [focusedElement, getFocusableElements, focusElement, onNavigate]);

  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const currentIndex = focusedElement ? elements.indexOf(focusedElement) : -1;
    const prevIndex =
      currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
    focusElement(elements[prevIndex]);
    onNavigate?.("up");
  }, [focusedElement, getFocusableElements, focusElement, onNavigate]);

  // Spatial navigation (for arrow keys)
  const findElementInDirection = useCallback(
    (direction: "up" | "down" | "left" | "right"): HTMLElement | null => {
      if (!focusedElement) return null;

      const elements = getFocusableElements();
      const currentRect = focusedElement.getBoundingClientRect();
      let bestElement: HTMLElement | null = null;
      let bestDistance = Infinity;
      let bestScore = Infinity;

      elements.forEach((element) => {
        if (element === focusedElement) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentCenterX = currentRect.left + currentRect.width / 2;
        const currentCenterY = currentRect.top + currentRect.height / 2;

        let isInDirection = false;
        let distance = 0;

        switch (direction) {
          case "up":
            isInDirection = centerY < currentCenterY - 10;
            distance =
              Math.abs(centerX - currentCenterX) +
              Math.max(0, currentCenterY - centerY);
            break;
          case "down":
            isInDirection = centerY > currentCenterY + 10;
            distance =
              Math.abs(centerX - currentCenterX) +
              Math.max(0, centerY - currentCenterY);
            break;
          case "left":
            isInDirection = centerX < currentCenterX - 10;
            distance =
              Math.abs(centerY - currentCenterY) +
              Math.max(0, currentCenterX - centerX);
            break;
          case "right":
            isInDirection = centerX > currentCenterX + 10;
            distance =
              Math.abs(centerY - currentCenterY) +
              Math.max(0, centerX - currentCenterX);
            break;
        }

        if (isInDirection && distance < bestScore) {
          bestElement = element;
          bestDistance = distance;
          bestScore = distance;
        }
      });

      return bestElement;
    },
    [focusedElement, getFocusableElements],
  );

  const focusUp = useCallback(() => {
    const element = findElementInDirection("up");
    if (element) {
      focusElement(element);
      onNavigate?.("up");
    }
  }, [findElementInDirection, focusElement, onNavigate]);

  const focusDown = useCallback(() => {
    const element = findElementInDirection("down");
    if (element) {
      focusElement(element);
      onNavigate?.("down");
    }
  }, [findElementInDirection, focusElement, onNavigate]);

  const focusLeft = useCallback(() => {
    const element = findElementInDirection("left");
    if (element) {
      focusElement(element);
      onNavigate?.("left");
    }
  }, [findElementInDirection, focusElement, onNavigate]);

  const focusRight = useCallback(() => {
    const element = findElementInDirection("right");
    if (element) {
      focusElement(element);
      onNavigate?.("right");
    }
  }, [findElementInDirection, focusElement, onNavigate]);

  const selectCurrent = useCallback(() => {
    if (focusedElement) {
      focusedElement.click();
      onNavigate?.("enter");
    }
  }, [focusedElement, onNavigate]);

  // Keyboard event handler
  useEffect(() => {
    if (!isTVMode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for navigation keys
      const navigationKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Enter",
        "Escape",
        "Backspace",
      ];

      if (navigationKeys.includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }

      switch (event.key) {
        case "ArrowUp":
          if (enableArrowKeys) focusUp();
          break;
        case "ArrowDown":
          if (enableArrowKeys) focusDown();
          break;
        case "ArrowLeft":
          if (enableArrowKeys) focusLeft();
          break;
        case "ArrowRight":
          if (enableArrowKeys) focusRight();
          break;
        case "Enter":
        case " ": // Space bar
          if (enableEnterSelect) selectCurrent();
          break;
        case "Escape":
        case "Backspace":
          if (enableBackButton) {
            window.history.back();
            onNavigate?.("back");
          }
          break;
        case "Tab":
          // Handle tab navigation
          event.preventDefault();
          if (event.shiftKey) {
            focusPrevious();
          } else {
            focusNext();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isTVMode,
    enableArrowKeys,
    enableEnterSelect,
    enableBackButton,
    focusUp,
    focusDown,
    focusLeft,
    focusRight,
    selectCurrent,
    focusNext,
    focusPrevious,
    onNavigate,
  ]);

  // Auto focus first element
  useEffect(() => {
    if (isTVMode && autoFocus && !focusedElement) {
      const elements = getFocusableElements();
      if (elements.length > 0) {
        focusElement(elements[0]);
      }
    }
  }, [isTVMode, autoFocus, focusedElement, getFocusableElements, focusElement]);

  return {
    focusedElement,
    focusNext,
    focusPrevious,
    focusUp,
    focusDown,
    focusLeft,
    focusRight,
    selectCurrent,
    setFocusedElement: focusElement,
    isTVMode,
  };
};

export default useTVNavigation;
