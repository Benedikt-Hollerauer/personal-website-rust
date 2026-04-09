import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';

// This should match the WorkHistoryItem type in AboutPage
interface WorkHistoryItem {
  id: string;
  year: string;
  title: string;
  text: string;
  emoji: string;
  accentColor: string;
}

// Helper to get and set localStorage overrides
function getWorkHistoryOverrides(): Record<string, { emoji?: string; accentColor?: string }> {
  try {
    return JSON.parse(localStorage.getItem('workHistoryOverrides') || '{}');
  } catch {
    return {};
  }
}
function setWorkHistoryOverride(id: string, data: { emoji?: string; accentColor?: string }) {
  const overrides = getWorkHistoryOverrides();
  overrides[id] = { ...overrides[id], ...data };
  localStorage.setItem('workHistoryOverrides', JSON.stringify(overrides));
}

// Dummy data for demonstration; in a real app, fetch from API or AboutPage fallback
const FALLBACK_WORK_HISTORY: WorkHistoryItem[] = [
  {
    id: 'history-1',
    year: '2021',
    title: 'Full-Stack Software Engineer',
    text: 'At boerse.de Group AG, I processed large data sets, built internal tools, and delivered new website features.',
    emoji: '👨‍💻',
    accentColor: '#8b5cf6',
  },
  {
    id: 'history-2',
    year: '2022',
    title: 'Career Transition',
    text: 'In a bridging warehouse role, I managed stock, coordinated shipments, and kept operations running smoothly.',
    emoji: '📦',
    accentColor: '#f59e0b',
  },
  {
    id: 'history-3',
    year: '2024',
    title: 'Software Engineer',
    text: 'I returned full-time to software and focused on architecture, delivery quality, and maintainable implementations.',
    emoji: '🧠',
    accentColor: '#22c55e',
  },
  {
    id: 'history-4',
    year: '2025',
    title: 'Software Engineer, Founder',
    text: 'I started building products independently while continuing to deliver robust software engineering projects.',
    emoji: '🚀',
    accentColor: '#ef4444',
  },
];

export function WorkHistoryAdminPage() {
  const [items] = useState<WorkHistoryItem[]>(FALLBACK_WORK_HISTORY);
  const [overrides, setOverrides] = useState(getWorkHistoryOverrides());

  useEffect(() => {
    setOverrides(getWorkHistoryOverrides());
  }, []);

  const handleEmojiChange = (id: string, emoji: string) => {
    setWorkHistoryOverride(id, { emoji });
    setOverrides(getWorkHistoryOverrides());
  };
  const handleColorChange = (id: string, accentColor: string) => {
    setWorkHistoryOverride(id, { accentColor });
    setOverrides(getWorkHistoryOverrides());
  };

  return (
    <AdminLayout pageTitle="Work History Admin">
      <h2>Work History Accent & Emoji</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Year</th>
            <th>Title</th>
            <th>Emoji</th>
            <th>Accent Color</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{item.year}</td>
              <td>{item.title}</td>
              <td>
                <input
                  type="text"
                  maxLength={2}
                  value={overrides[item.id]?.emoji || item.emoji}
                  onChange={(e) => handleEmojiChange(item.id, e.target.value)}
                  style={{ fontSize: '1.5rem', width: '2.5rem', textAlign: 'center' }}
                />
              </td>
              <td>
                <input
                  type="color"
                  value={overrides[item.id]?.accentColor || item.accentColor}
                  onChange={(e) => handleColorChange(item.id, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 16, color: '#888' }}>
        Changes are saved locally in your browser and will only affect your view.
      </p>
    </AdminLayout>
  );
}
