"use client";

import { useEffect, useState } from "react";

type Task = { id: string; text: string; done: boolean; category: string; important: boolean };
const categories = ["개인", "업무", "공부"];
const initial: Task[] = [
  { id: "1", text: "오늘의 가장 중요한 일 정하기", done: false, category: "개인", important: true },
  { id: "2", text: "진행 중인 프로젝트 정리하기", done: false, category: "업무", important: false },
  { id: "3", text: "책 10페이지 읽기", done: false, category: "공부", important: false },
  { id: "4", text: "물 한 잔 마시고 하루 시작하기", done: true, category: "개인", important: false },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("개인");
  const [filter, setFilter] = useState("전체");
  const [section, setSection] = useState("오늘의 할 일");
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("oneul-tasks");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(t => t && typeof t.id === "string" && typeof t.text === "string" && typeof t.done === "boolean" && typeof t.important === "boolean" && categories.includes(t.category))) setTasks(parsed);
      }
    } catch { setError("저장된 목록을 불러오지 못했어요."); }
    setDate(new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long" }).format(new Date()));
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem("oneul-tasks", JSON.stringify(tasks)); } catch { setError("브라우저 저장 공간을 사용할 수 없어 변경 내용을 저장하지 못했어요."); }
  }, [tasks, ready]);
  const done = tasks.filter(t => t.done).length;
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  const visible = tasks.filter(t => (section !== "중요한 일" || t.important) && (!categories.includes(section) || t.category === section) && (filter === "전체" || (filter === "완료" ? t.done : !t.done)));
  const update = (id: string, patch: Partial<Task>) => setTasks(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="오늘 홈"><span className="brand-mark">✓</span> 오늘<span className="brand-dot">.</span></a>
      <div className="workspace-label">MY WORKSPACE</div>
      <nav aria-label="할 일 탐색">
        {["오늘의 할 일", "중요한 일"].map((s, i) => <button className={`nav-item ${section === s ? "active" : ""}`} key={s} onClick={() => setSection(s)}><span>{i ? "☆" : "▦"}</span>{s}<b>{i ? tasks.filter(t => t.important).length : tasks.length}</b></button>)}
        <div className="workspace-label category-label">카테고리</div>
        {categories.map((s, i) => <button className={`nav-item ${section === s ? "active" : ""}`} key={s} onClick={() => setSection(s)}><span className={`category-dot dot-${i}`} />{s}<b>{tasks.filter(t => t.category === s).length}</b></button>)}
      </nav>
      <div className="sidebar-note"><span>✳</span><p>작은 실천이 모여<br />더 나은 하루가 돼요.</p><div className="note-line" /></div>
      <div className="profile"><span className="avatar">나</span><div><strong>나의 작은 워크스페이스</strong><small>한 번에 하나씩, 천천히</small></div></div>
    </aside>
    <main>
      <header className="topbar"><span>나의 하루 <span className="breadcrumb">/ {section}</span></span><span className="local-badge"><i /> 이 브라우저에 저장</span></header>
      <div className="content">
        <div className="date">{date || "나만의 하루를 시작해요"}<span> A FRESH START</span></div>
        <div className="page-heading"><div><h1>{section}<span>✳</span></h1><p>가벼운 마음으로, 오늘도 하나씩 해볼까요?</p></div><span className="day-stamp">MAKE<br />TODAY<br /><em>count.</em></span></div>
        <section className="progress-card" aria-label="전체 할 일 진행 상황"><div className="progress-copy"><span className="eyebrow">오늘의 작은 성취</span><h2>{tasks.length && done === tasks.length ? "오늘의 할 일을 모두 마쳤어요!" : "좋아요, 나만의 속도로 가고 있어요."}</h2><p>전체 {tasks.length}개의 할 일 중 <strong>{done}개 완료</strong></p><div className="progress-track"><div style={{ width: `${percent}%` }} /></div></div><div className="progress-circle" style={{ background: `conic-gradient(#d4e1ac ${percent}%, #ffffff20 0)` }}><div><strong>{percent}<small>%</small></strong><span>차곡차곡 달성 중</span></div></div></section>
        <form className="add-form" onSubmit={e => { e.preventDefault(); if (!text.trim() || !ready) return; setTasks(ts => [...ts, { id: crypto.randomUUID(), text: text.trim(), done: false, category, important: false }]); setText(""); }}><span className="input-plus">＋</span><input aria-label="새로운 할 일" placeholder="어떤 일을 해볼까요?" value={text} onChange={e => setText(e.target.value)} maxLength={200} required /><select aria-label="카테고리" value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select><button className="add-button" disabled={!ready || !text.trim()}>추가하기 <span>↵</span></button></form>
        {error && <p role="alert" className="error">{error}</p>}
        <section className="task-section"><div className="list-toolbar"><div className="filters" aria-label="완료 상태 필터">{["전체", "진행 중", "완료"].map(f => <button key={f} className={filter === f ? "selected" : ""} onClick={() => setFilter(f)}>{f}{f === "전체" && <span>{tasks.length}</span>}</button>)}</div><span className="list-count">{visible.length}개의 할 일</span></div>
        <div className="task-list">{visible.length ? visible.map(t => <div className={`task-row ${t.done ? "is-done" : ""}`} key={t.id}><button className="checkbox" aria-label={`${t.text} ${t.done ? "완료 취소" : "완료"}`} aria-pressed={t.done} onClick={() => update(t.id, { done: !t.done })}>{t.done && "✓"}</button><span className="task-text">{t.text}</span><span className={`tag tag-${categories.indexOf(t.category)}`}>{t.category}</span><button className={`star ${t.important ? "starred" : ""}`} aria-label={`${t.text} 중요 표시`} aria-pressed={t.important} onClick={() => update(t.id, { important: !t.important })}>{t.important ? "★" : "☆"}</button><button className="delete" aria-label={`${t.text} 삭제`} onClick={() => setTasks(ts => ts.filter(item => item.id !== t.id))}>×</button></div>) : <div className="empty"><span>✓</span><h3>마음에도 여백을 남겨두세요</h3><p>표시할 할 일이 없어요. 새로운 할 일을 추가해 보세요.</p></div>}</div>
        <div className="list-footer"><span><i /> {tasks.length - done}개의 할 일이 기다리고 있어요</span><button disabled={!done} onClick={() => setTasks(ts => ts.filter(t => !t.done))}>완료한 일 지우기</button></div></section>
        <footer className="quote"><span>“</span>완벽한 하루보다, 조금씩 나아가는 하루.<div>ONE THING AT A TIME</div></footer>
      </div>
    </main>
  </div>;
}
