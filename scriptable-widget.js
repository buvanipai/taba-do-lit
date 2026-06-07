// taba widget — Scriptable iOS
// Setup: paste your values below, then add to Scriptable + home screen

const FIREBASE_API_KEY = "AIzaSyBe7ctizrEsW8El2lOTpxJBk1gbtILu-F0";
const FIREBASE_PROJECT_ID = "taba-do-list";
const USER_ID = "fijgxldHV4Ohomn1vhjINEa7r8F2";

const MAX_TASKS = config.widgetFamily === "large" ? 8 : config.widgetFamily === "medium" ? 4 : 3;

const PRIORITY_COLORS = {
  high:   new Color("#e05260"),
  medium: new Color("#f4a228"),
  low:    new Color("#2ec4b6"),
};

const BG_COLOR     = new Color("#e0e5ec");
const TEXT_COLOR   = new Color("#3d4a5c");
const MUTED_COLOR  = new Color("#8896a7");
const ACCENT_COLOR = new Color("#6c63ff");

async function fetchTodos() {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${USER_ID}/todos?key=${FIREBASE_API_KEY}`;
  const req = new Request(url);
  const res = await req.loadJSON();

  if (!res.documents) return [];

  return res.documents
    .map(doc => {
      const f = doc.fields;
      return {
        text:      f.text?.stringValue || "",
        priority:  f.priority?.stringValue || "medium",
        order:     Number(f.order?.integerValue || f.order?.doubleValue || 0),
        completed: f.completed?.booleanValue || false,
        dueDate:   f.dueDate?.stringValue || null,
        timeEst:   f.timeEstimate?.stringValue || null,
      };
    })
    .filter(t => !t.completed && t.text)
    .sort((a, b) => a.order - b.order)
    .slice(0, MAX_TASKS);
}

function buildWidget(todos) {
  const w = new ListWidget();
  w.backgroundColor = BG_COLOR;
  w.setPadding(16, 16, 16, 16);
  w.url = "https://taba-do-list.web.app";

  // Header
  const header = w.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();

  const title = header.addText("taba");
  title.font = Font.boldSystemFont(18);
  title.textColor = TEXT_COLOR;

  header.addSpacer();

  const count = header.addText(`${todos.length} left`);
  count.font = Font.systemFont(11);
  count.textColor = MUTED_COLOR;

  w.addSpacer(10);

  if (todos.length === 0) {
    const empty = w.addText("All done! 🎉");
    empty.font = Font.systemFont(14);
    empty.textColor = MUTED_COLOR;
    empty.centerAlignText();
  } else {
    for (const todo of todos) {
      const row = w.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();
      row.spacing = 8;

      // Priority dot
      const dot = row.addText("●");
      dot.font = Font.systemFont(8);
      dot.textColor = PRIORITY_COLORS[todo.priority] || PRIORITY_COLORS.medium;

      // Task text
      const col = row.addStack();
      col.layoutVertically();

      const label = col.addText(todo.text);
      label.font = Font.systemFont(13);
      label.textColor = TEXT_COLOR;
      label.lineLimit = 1;

      // Meta (time estimate or due date)
      if (todo.timeEst || todo.dueDate) {
        const meta = col.addText([todo.timeEst, todo.dueDate].filter(Boolean).join(" · "));
        meta.font = Font.systemFont(10);
        meta.textColor = MUTED_COLOR;
      }

      w.addSpacer(6);
    }
  }

  w.addSpacer();

  // Footer
  const footer = w.addText("tap to open →");
  footer.font = Font.systemFont(10);
  footer.textColor = ACCENT_COLOR;
  footer.rightAlignText();

  return w;
}

// Error widget fallback
function errorWidget(msg) {
  const w = new ListWidget();
  w.backgroundColor = BG_COLOR;
  w.setPadding(16, 16, 16, 16);
  const t = w.addText("taba ⚠️\n" + msg);
  t.font = Font.systemFont(12);
  t.textColor = new Color("#e05260");
  t.minimumScaleFactor = 0.5;
  return w;
}

try {
  const todos = await fetchTodos();
  const widget = buildWidget(todos);
  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    await widget.presentMedium();
  }
} catch (e) {
  const w = errorWidget(e.message);
  if (config.runsInWidget) Script.setWidget(w);
  else await w.presentSmall();
}

Script.complete();
