"use client";

import axios from "axios";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { emotionConfig } from "./config";
import { ColorRing } from "react-loader-spinner";

export default function Home() {
  const defaultColor = "#eee";
  const [rows, setRows] = useState(2);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<{ label: string; score: number }[]>();
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState(defaultColor);
  const [tagVisible, setTagVisible] = useState(false);

  useEffect(() => {
    //
    const clearST = setTimeout(() => {
      runPrediction();
    }, 1000);

    return () => {
      clearTimeout(clearST);
    };
  }, [input]);

  useEffect(() => {
    handleColor();
    setTagVisible(true);
  }, [output]);

  function handleColor() {
    if (output && output.length > 0) {
      const colorKey = (output as any[])[0].label;
      const colorHex = (emotionConfig as any)[colorKey].colorHex;
      setColor(colorHex);
    }
  }

  async function runPrediction() {
    if (input) {
      setLoading(true);
      setTagVisible(false);
      // send api call
      const res = await axios.post("api/emotion", { input: input });
      console.log(res);
      setOutput(res.data.filteredResponse);
      setLoading(false);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    setInput(event.target.value);
    // rows 변경 - Math.max(최소, 최대), scrollHeight는 readonly 이며, 20 은 각 행 높이 (문자 높이)
    const newRows = Math.max(1, Math.ceil(event.target.scrollHeight / 20));
    setRows(newRows);
  }
  // color + "55" 뒷 숫자는 opacity 알파값
  return (
    <main
      style={{ backgroundColor: color + "55" }}
      className="transition-all delay-500 flex min-h-screen flex-col justify-center items-center p-24 gap-4"
    >
      <h1 className="text-2xl lg:text-4xl font-mono font-semibold tracking-tight">
        ✨ 나의 감정 색은..🎨
      </h1>
      <div className="w-1/2 border-2 border-black p-4 rounded-lg">
        <textarea
          rows={rows}
          onChange={handleInputChange}
          className="resize-none outline-none block w-full text-sm placeholder-slate-600 bg-transparent"
          placeholder="type how you feel .."
        ></textarea>
      </div>
      <p>
        {`> `}
        {input}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {output?.map(({ label, score }) => {
          return (
            <span
              style={{ opacity: tagVisible ? 1 : 0 }}
              key={label}
              className="transition-all cursor-pointer bg-indigo-100 text-indigo-800 text-lg px-4 py-1 rounded-full border border-indigo-400"
            >
              {label}
              {(emotionConfig as any)[label].emoji}
            </span>
          );
        })}
      </div>
      {loading && renderLoader()}
    </main>
  );

  function renderLoader() {
    return (
      <ColorRing
        visible={true}
        height="80"
        width="80"
        ariaLabel="color-ring-loading"
        wrapperStyle={{}}
        wrapperClass="color-ring-wrapper"
        colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
      />
    );
  }
}
