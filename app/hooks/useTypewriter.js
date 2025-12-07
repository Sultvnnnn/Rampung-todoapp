// app/hooks/useTypewriter.js
import { useState, useEffect } from "react";

export function useTypewriter(
  words,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseTime = 1500
) {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  //! Efek kedap-kedip kursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  //! Efek ngetik
  useEffect(() => {
    if (!words || words.length === 0) return;

    const i = loopNum % words.length;
    const fullText = words[i];

    let timeoutId;

    if (!isDeleting && text === fullText) {
      timeoutId = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
    } else if (isDeleting && text === "") {
      timeoutId = setTimeout(() => {
        setIsDeleting(false);
        setLoopNum((prev) => prev + 1);
      }, 500);
    } else {
      const speed = isDeleting ? deletingSpeed : typingSpeed;

      timeoutId = setTimeout(() => {
        setText((prev) =>
          isDeleting
            ? fullText.substring(0, prev.length - 1)
            : fullText.substring(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timeoutId);
  }, [text, isDeleting, loopNum, words, typingSpeed, deletingSpeed, pauseTime]);

  return text + (cursorVisible ? "|" : "");
}
