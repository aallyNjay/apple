import { useEffect, useState } from "react";

// 백엔드 연결 확인용 최소 화면.
// /api/hello 를 호출하며, Vite 프록시가 이를 Spring Boot(8080)로 전달한다.
export default function App() {
  const [message, setMessage] = useState("불러오는 중...");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.text())
      .then(setMessage)
      .catch(() => setMessage("백엔드에 연결하지 못했습니다 (Spring Boot 8080 실행 확인)"));
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>apple frontend</h1>
      <p>백엔드 응답: {message}</p>
    </main>
  );
}
