"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useI18n } from "@/i18n/LanguageProvider";
import {
  translateElementAttributes,
  translateTextNode,
} from "@/i18n/system-translations";

const translateTree = (root: ParentNode, locale: "fr" | "en") => {
  const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let textNode = textWalker.nextNode();
  while (textNode) {
    translateTextNode(textNode as Text, locale);
    textNode = textWalker.nextNode();
  }

  const elements =
    root instanceof Element
      ? [root, ...Array.from(root.querySelectorAll("*"))]
      : Array.from(root.querySelectorAll("*"));

  for (const element of elements) {
    translateElementAttributes(element, locale);
  }
};

export function SystemTranslator() {
  const { locale } = useI18n();
  const pathname = usePathname();

  useEffect(() => {
    translateTree(document.body, locale);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateTextNode(mutation.target as Text, locale);
          continue;
        }

        if (mutation.type === "attributes") {
          translateElementAttributes(mutation.target as Element, locale);
          continue;
        }

        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node as Text, locale);
          } else if (node instanceof Element) {
            translateTree(node, locale);
          }
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [
        "placeholder",
        "title",
        "aria-label",
        "aria-valuetext",
        "alt",
        "data-label",
        "data-title",
        "data-tooltip",
        "value",
      ],
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [locale, pathname]);

  return null;
}
