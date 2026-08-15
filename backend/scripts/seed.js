import pool from '../db/client.js';

const projectsData = [
  { repo: 'videotube_backend', title: 'VideoTube Backend', description: 'Backend for a video platform with uploads, processing, auth, and streaming-focused APIs.', featured: true, display_order: 1 },
  { repo: 'videotube-frontend', title: 'VideoTube Frontend', description: 'Vue frontend for the VideoTube platform with a polished streaming-style interface.', featured: true, display_order: 2 },
  { repo: 'LectureLog_backend', title: 'LectureLog Backend', description: 'Backend system for LectureLog, designed to manage learning workflows and academic data.', featured: true, display_order: 3 },
  { repo: 'BigV', title: 'BigV', description: 'Work queue based system focused on task distribution and backend processing.', featured: true, display_order: 4 },
  { repo: 'Signal', title: 'Signal', description: 'Django blog backend with protection-focused features and content management flows.', featured: true, display_order: 5 },
  { repo: 'Doot', title: 'Doot', description: 'Chat application built around real-time messaging and a cleaner communication experience.', featured: true, display_order: 6 },
  { repo: 'VerifyX', title: 'VerifyX', description: 'Email and phone verification system using Upstash Redis for secure code handling.', featured: true, display_order: 7 },
  { repo: 'titan', title: 'Titan', description: 'High-performance reverse proxy and security gateway written in Zig.', featured: true, display_order: 8 },
  { repo: 'Real_Estate_AI_Agent', title: 'Real Estate AI Agent', description: 'AI agent project built to automate client scheduling and meeting coordination.', featured: false, display_order: 9 },
  { repo: 'Drug-Solubilitoo', title: 'Drug Solubilitoo', description: 'Pharma-focused project around solubility prediction as part of ADMET analysis workflows.', featured: false, display_order: 10 },
  { repo: 'Code-Runner', title: 'Code Runner', description: 'Universal code runner for 35+ languages, created for the Zed editor ecosystem.', featured: false, display_order: 11 },
  { repo: 'Choco', title: 'Choco', description: 'AI-integrated 2D virtual avatar project exploring interactive assistant experiences.', featured: false, display_order: 12 },
  { repo: 'Weather_app', title: 'Weather App', description: 'Weather web app for checking forecast details through a simple frontend flow.', featured: false, display_order: 13 },
  { repo: 'dna-mutation-env', title: 'DNA Mutation Env', description: 'Open-ended reinforcement learning environment centered on DNA mutation experiments.', featured: false, display_order: 14 },
  { repo: 'Door_Of_Reality', title: 'Door Of Reality', description: 'Game discovery platform concept for browsing and exploring titles in one place.', featured: false, display_order: 15 },
  { repo: 'TodoListVueJS', title: 'Todo List VueJS', description: 'Basic Vue todo list project with simple task tracking interactions.', featured: false, display_order: 16 },
  { repo: 'Vue_Quote_Generator', title: 'Vue Quote Generator', description: 'Mini Vue project that generates and displays quotes in a lightweight UI.', featured: false, display_order: 17 },
  { repo: 'Qr_Genarator', title: 'QR Generator', description: 'Small utility project for generating QR codes from user input.', featured: false, display_order: 18 },
  { repo: 'Billboard_project', title: 'Billboard Project', description: 'Hackathon project built around the Tech Nova event idea.', featured: false, display_order: 19 },
  { repo: 'Collage_canteen', title: 'College Canteen', description: 'Hackathon project for a college canteen workflow and ordering experience.', featured: false, display_order: 20 },
  { repo: 'Todo-list', title: 'Todo List', description: 'Simple HTML, CSS, and JavaScript todo list built as a lightweight practice project.', featured: false, display_order: 21 },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Copy backend/.env.example to backend/.env and configure it.');
  }

  const client = await pool.connect();
  try {
    console.log('🌱 Starting seed...');
    await client.query('BEGIN');
    // Upsert keeps manually edited records and makes seeding repeatable.
    for (const project of projectsData) {
      await client.query(
        `INSERT INTO projects (repo, title, description, featured, display_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (repo) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           featured = EXCLUDED.featured,
           display_order = EXCLUDED.display_order,
           updated_at = CURRENT_TIMESTAMP`,
        [project.repo, project.title, project.description, project.featured, project.display_order]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ Seeded ${projectsData.length} projects successfully`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exitCode = 1;
});
