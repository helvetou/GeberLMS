import { getPlatformProxy } from 'wrangler';
import { createDb } from '../src/lib/server/db';
import { importCourse } from '../src/lib/server/import';

const { env } = await getPlatformProxy<{ DB: D1Database }>();
const db = createDb(env.DB);

const payload = {
  title: 'Verilog pour débutants',
  slug: 'verilog-debutants',
  language: 'fr',
  description: 'Les bases du FPGA en Verilog.',
  category: 'fpga',
  level: 'debutant',
  is_public: true,
  price_cents: 4900,
  modules: [
    {
      key: 'fondations',
      title: 'Fondations',
      lessons: [
        { key: 'combinatoire', title: 'Combinatoire vs séquentiel', type: 'text', content_markdown: '# Intro\nUn circuit combinatoire…' },
        { key: 'sim', title: 'Simulation Icarus', type: 'video', video_url: 'courses/verilog/sim.mp4' },
        { key: 'quiz', title: 'Quiz rappel', type: 'quiz', quiz_data: { passing_score: 80, questions: [ { question: 'Quel bloc pour séquentiel ?', options: ['assign','always @(posedge clk)','initial'], correct_index: 1 } ] } },
      ],
    },
  ],
};

const r1 = await importCourse(db, payload, 'strict');
console.log('STRICT create:', JSON.stringify(r1));

const r2 = await importCourse(db, { ...payload, title: 'Verilog (révisé)' }, 'upsert');
console.log('UPSERT reconcile — sameId=', r2.courseId === r1.courseId, 'résultat:', JSON.stringify(r2));
