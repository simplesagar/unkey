"use client";
import { cn } from "@/lib/utils";
import { Highlight, themes } from "prism-react-renderer";
import React from "react";
import { CopyButton } from "./copy-button";
import { BlogCodeDownload } from "./svg/blog-code-block";

const _customTheme = themes.vsDark;
//console.log("Custom Theme", customTheme);
const custom = {
  plain: {
    color: "#3CEEAE",
    backgroundColor: "#1E1E1E",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "rgb(255,255,255)",
      },
    },
    {
      types: ["builtin", "changed", "keyword", "interpolation-punctuation"],
      style: {
        color: "#9D72FF",
      },
    },
    {
      types: ["number", "inserted"],
      style: {
        color: "#FB3186",
      },
    },
    {
      types: ["constant"],
      style: {
        color: "#9D72FF",
      },
    },
    {
      types: ["attr-name", "variable"],
      style: {
        color: "#9D72FF",
      },
    },
    {
      types: ["deleted", "string", "attr-value", "template-punctuation"],
      style: {
        color: "#3CEEAE",
      },
    },
    {
      types: ["selector"],
      style: {
        color: "#9D72FF",
      },
    },
    {
      types: ["tag"],
      style: {
        color: "#3CEEAE",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "rgb(212, 212, 212)",
      },
    },
    {
      types: ["punctuation"],
      languages: ["markup"],
      style: {
        color: "#808080",
      },
    },
    {
      types: ["function"],
      style: {
        color: "#9D72FF",
      },
    },
    {
      types: ["class-name"],
      style: {
        color: "rgb(78, 201, 176)",
      },
    },
    {
      types: ["char"],
      style: {
        color: "rgb(209, 105, 105)",
      },
    },
    {
      types: ["string-property"],
      style: {
        color: "#9D72FF",
      },
    },
    {
      types: ["string"],
      style: {
        color: "#3CEEAE",
      },
    },
  ],
};

export function BlogCodeBlockSingle({ className, children }: any) {
  const block = children.props;
  //console.log("Block Classname", block.className);
  //console.log(children);
  function handleDownload() {
    const element = document.createElement("a");
    const file = new Blob([block.children], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "code.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }
  return (
    <div
      className={cn(
        "flex flex-col bg-gradient-to-t from-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.07)] rounded-[20px] border-[.5px] border-[rgba(255,255,255,0.1)]",
        className,
      )}
    >
      <div className="flex justify-end border-b-[.5px] border-white/10 p-2 pr-4 w-full ">
        <CopyButton value={block.children} />
        <button type="button" className="p-0 m-0 bg-transparent" onClick={handleDownload}>
          <BlogCodeDownload />
        </button>
      </div>
      <Highlight
        theme={custom}
        code={block.children}
        language={block.className.replace(/language-/, "")}
      >
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="leading-10 border-none rounded-none bg-transparent">
            {tokens.map((line, i) => (
              <div key={`${line}-${i}`} {...getLineProps({ line })}>
                <span className="pl-4 pr-8 text-white/20 text-center">{i + 1}</span>
                {line.map((token, key) => (
                  <span key={` ${key}-${token}`} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
