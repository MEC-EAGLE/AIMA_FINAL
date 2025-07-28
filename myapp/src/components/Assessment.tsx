import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import { getUsers, saveUsers } from '../utils';
import { User } from '../types';

interface Q {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

const QUESTIONS: Q[] = [
  {
    id: 1,
    question: 'What is the output of `console.log(typeof NaN);`?',
    options: ['"number"', '"NaN"', '"undefined"', '"object"'],
    answer: '"number"'
  },
  {
    id: 2,
    question: 'Which array method creates a new array with elements that pass a test?',
    options: ['map()', 'forEach()', 'filter()', 'reduce()'],
    answer: 'filter()'
  },
  {
    id: 3,
    question: 'What keyword is used to declare a constant in JavaScript?',
    options: ['var', 'let', 'const', 'static'],
    answer: 'const'
  },
  {
    id: 4,
    question: 'Which data structure follows the LIFO principle?',
    options: ['Queue', 'Stack', 'Tree', 'Graph'],
    answer: 'Stack'
  },
  {
    id: 5,
    question: 'What is the time complexity of binary search on a sorted array?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    answer: 'O(log n)'
  },
  {
    id: 6,
    question: 'Which sorting algorithm is stable?',
    options: ['Quick Sort', 'Heap Sort', 'Merge Sort', 'Selection Sort'],
    answer: 'Merge Sort'
  },
  {
    id: 7,
    question: 'What will `Array.from(new Set([1,2,2,3]))` return?',
    options: ['[1,2,3]', '[1,2,2,3]', '[3,2,1]', 'Error'],
    answer: '[1,2,3]'
  },
  {
    id: 8,
    question: 'How do you reverse a string `str` in JavaScript?',
    options: ["str.split('').reverse().join('')", 'str.reverse()', 'reverse(str)', 'Array.reverse(str)'],
    answer: "str.split('').reverse().join('')"
  },
  {
    id: 9,
    question: 'Which built-in method sorts the elements of an array?',
    options: ['sort()', 'order()', 'arrange()', 'sorted()'],
    answer: 'sort()'
  },
  {
    id: 10,
    question: 'Which LeetCode problem asks to find two numbers that sum to a target?',
    options: ['Two Sum', 'Add Two Numbers', 'Target Sum', 'Pair Sum'],
    answer: 'Two Sum'
  },
  {
    id: 11,
    question: 'What is the output of `console.log(0.1 + 0.2 === 0.3);`?',
    options: ['true', 'false', 'undefined', '0.3'],
    answer: 'false'
  },
  {
    id: 12,
    question: 'Which JavaScript feature makes handling asynchronous code easier?',
    options: ['Promises', 'async/await', 'Generators', 'Callbacks'],
    answer: 'async/await'
  },
  {
    id: 13,
    question: 'Which LeetCode problem asks you to merge two sorted linked lists?',
    options: ['Merge Two Sorted Lists', 'Merge Intervals', 'Sort List', 'Add Two Numbers'],
    answer: 'Merge Two Sorted Lists'
  },
  {
    id: 14,
    question: 'Which algorithm uses divide and conquer to select the k-th smallest element?',
    options: ['Quickselect', 'Bubble Sort', 'Counting Sort', 'Radix Sort'],
    answer: 'Quickselect'
  },
  {
    id: 15,
    question: 'What is the space complexity of recursive DFS on a tree of height h?',
    options: ['O(h)', 'O(n)', 'O(log n)', 'O(1)'],
    answer: 'O(h)'
  },
  {
    id: 16,
    question: 'Which method converts a JSON string into a JavaScript object?',
    options: ['JSON.stringify', 'JSON.parse', 'toJSON', 'parseJSON'],
    answer: 'JSON.parse'
  },
  {
    id: 17,
    question: 'What data structure is commonly used to implement a priority queue?',
    options: ['Stack', 'Binary heap', 'Linked list', 'Hash map'],
    answer: 'Binary heap'
  },
  {
    id: 18,
    question: 'Which LeetCode problem requires finding the longest substring without repeating characters?',
    options: ['Longest Substring Without Repeating Characters', 'Longest Palindromic Substring', 'Longest Common Subsequence', 'Longest Increasing Subsequence'],
    answer: 'Longest Substring Without Repeating Characters'
  },
  {
    id: 19,
    question: 'What algorithmic technique is used to efficiently handle subarray problems?',
    options: ['Dynamic Programming', 'Sliding Window', 'Greedy', 'Backtracking'],
    answer: 'Sliding Window'
  },
  {
    id: 20,
    question: 'What is the average-case time complexity of Quick Sort?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n^2)'],
    answer: 'O(n log n)'
  }
];

export default function Assessment() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rankings, setRankings] = useState<User[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return navigate('/login');
    const me: User = JSON.parse(stored);
    if (me.type !== 'member') return navigate('/dashboard');
    setUser(me);
    getUsers().then(all => setRankings(all));
  }, [navigate]);

  if (!user) return null;

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let score = 0;
      for (const q of QUESTIONS) {
        if (answers[q.id] === q.answer) score += 1;
      }
      const all = await getUsers();
      const idx = all.findIndex(u => u.email === user.email);
      all[idx].codingScore = score;
      await saveUsers(all);
      localStorage.setItem('currentUser', JSON.stringify(all[idx]));
      setUser(all[idx]);
      setRankings(all);
    } catch (err) {
      console.error('Failed to save assessment', err);
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  const next = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      submit();
    }
  };

  const sorted = [...rankings].filter(
    u => u.type === 'member' && u.codingScore !== undefined
  );
  sorted.sort((a, b) => (b.codingScore || 0) - (a.codingScore || 0));
  const rank = sorted.findIndex(u => u.email === user.email) + 1;

  return (
    <div>
      <Nav />
      <div className="container my-4" style={{ maxWidth: '700px' }}>
        <h2>Assessment</h2>
        {!submitted ? (
          !started ? (
            <div className="text-center">
              <p className="mb-3">
                Start the quiz to test your coding knowledge. You can't go back
                once you proceed.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setStarted(true)}
              >
                Start Quiz
              </button>
            </div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                next();
              }}
            >
              <div className="mb-3">
                <p className="fw-bold">{QUESTIONS[current].question}</p>
                {QUESTIONS[current].options.map(opt => (
                  <div className="form-check" key={opt}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`q${QUESTIONS[current].id}`}
                      value={opt}
                      checked={
                        answers[QUESTIONS[current].id] === opt
                      }
                      onChange={() =>
                        setAnswers(a => ({
                          ...a,
                          [QUESTIONS[current].id]: opt,
                        }))
                      }
                    />
                    <label className="form-check-label">{opt}</label>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!answers[QUESTIONS[current].id] || loading}
              >
                {current < QUESTIONS.length - 1
                  ? 'Next'
                  : loading
                  ? 'Submitting...'
                  : 'Submit'}
              </button>
            </form>
          )
        ) : (
          <div>
            <h4 className="mb-3">Your score: {user.codingScore}/{QUESTIONS.length}</h4>
            {rank > 0 && (
              <p>
                Rank {rank} of {sorted.length}
              </p>
            )}
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((u, i) => (
                  <tr key={u.email} className={u.email === user.email ? 'table-primary' : ''}>
                    <td>{i + 1}</td>
                    <td>{u.contactName}</td>
                    <td>{u.codingScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
