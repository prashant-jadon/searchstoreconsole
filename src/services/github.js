const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.REACT_APP_GITHUB_USERNAME;
const GITHUB_REPO = process.env.REACT_APP_GITHUB_REPO;

export const uploadToGithub = async (file, path) => {
  try {
    if (!GITHUB_TOKEN || !GITHUB_USERNAME || !GITHUB_REPO) {
      throw new Error('GitHub configuration is missing. Check your .env file.');
    }

    // First, check if file exists and get its SHA if it does
    const existingFile = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      }
    );

    const base64Content = await fileToBase64(file);
    let sha = null;

    if (existingFile.ok) {
      const fileData = await existingFile.json();
      sha = fileData.sha;
    }

    // Prepare request body
    const body = {
      message: `Upload ${path}`,
      content: base64Content,
      branch: 'main'
    };

    // If file exists, include its SHA
    if (sha) {
      body.sha = sha;
    }

    // Create or update file in GitHub
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API Error:', errorData);
      throw new Error(`GitHub API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the raw URL
    return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/main/${path}`;
  } catch (error) {
    console.error('GitHub upload error:', error);
    throw error;
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
      resolve(encoded);
    };
    reader.onerror = error => reject(error);
  });
};

// Add this function to test GitHub API access
export const testGithubAccess = async () => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      }
    );
    const data = await response.json();
    console.log('GitHub API Test:', data);
    return response.ok;
  } catch (error) {
    console.error('GitHub API Test Error:', error);
    return false;
  }
}; 