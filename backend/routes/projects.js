import express from 'express';
import { query as dbQuery } from '../db/client.js';
import { syncGithubProjects } from '../services/github-sync.js';

const router = express.Router();

// GET all projects
router.get('/', async (req, res) => {
  try {
    await syncGithubProjects();
    const result = await dbQuery(
      `SELECT id, title, description, repo, github_stars, featured, display_order, created_at
       FROM projects 
       ORDER BY github_stars DESC, featured DESC, display_order ASC`
    );
    
    res.json({
      success: true,
      data: result.rows.map(project => ({
        ...project,
        link: `https://github.com/Coder-Delta/${project.repo}`,
        image: `https://opengraph.githubassets.com/1/Coder-Delta/${project.repo}`
      }))
    });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch projects' 
    });
  }
});

// GET single project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Project id must be a positive integer' });
    }
    const result = await dbQuery(
      `SELECT id, title, description, repo, github_stars, featured, display_order, created_at
       FROM projects 
       WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    const project = result.rows[0];
    res.json({
      success: true,
      data: {
        ...project,
        link: `https://github.com/Coder-Delta/${project.repo}`,
        image: `https://opengraph.githubassets.com/1/Coder-Delta/${project.repo}`
      }
    });
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch project' 
    });
  }
});

export default router;
