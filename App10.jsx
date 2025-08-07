
// import { useEffect, useState } from 'react';
// import axios from 'axios';

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [repos, setRepos] = useState([]);
//   const [files, setFiles] = useState([]);
//   const [selectedRepo, setSelectedRepo] = useState('');
//   const [selectedFile, setSelectedFile] = useState('');
//   const [fileContent, setFileContent] = useState('');
//   const [testCases, setTestCases] = useState('');
//   const [prUrl, setPrUrl] = useState('');

//   useEffect(() => {
//     axios.get('http://localhost:5000/auth/user', { withCredentials: true })
//       .then(res => setUser(res.data.user))
//       .catch(() => {});
//   }, []);

//   const fetchRepos = async () => {
//     const res = await axios.get('http://localhost:5000/api/repos', { withCredentials: true });
//     setRepos(res.data);
//   };

//   const fetchFiles = async (repo) => {
//     const res = await axios.get(`http://localhost:5000/api/files?repo=${repo}`, { withCredentials: true });
//     setFiles(res.data);
//   };

//   const loadFileContent = async (url) => {
//     const res = await axios.get(url);
//     setFileContent(atob(res.data.content));
//   };

//   const generateTests = async () => {
//     const language = selectedFile.endsWith('.py') ? 'Python' : 'JavaScript';
//     const res = await axios.post('http://localhost:5000/api/testcases', {
//       code: fileContent,
//       language,
//     });
//     setTestCases(res.data.test);
//   };

//   const submitPR = async () => {
//     const res = await axios.post('http://localhost:5000/api/create-pr', {
//       repo: selectedRepo,
//       filename: selectedFile.replace(/\..+$/, ''),
//       testCode: testCases,
//     }, { withCredentials: true });
//     setPrUrl(res.data.url);
//   };

//   if (!user) return <a href="http://localhost:5000/auth/github">Login with GitHub</a>;

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Welcome {user.username}</h2>
//       <button onClick={fetchRepos}>Load Repositories</button>
//       <div>
//         <select onChange={(e) => {
//           setSelectedRepo(e.target.value);
//           fetchFiles(e.target.value);
//         }}>
//           <option>Select Repo</option>
//           {repos.map((r, i) => <option key={i} value={r.full_name}>{r.name}</option>)}
//         </select>
//       </div>
//       <div>
//         <select onChange={(e) => {
//           setSelectedFile(e.target.value);
//           loadFileContent(e.target.value);
//         }}>
//           <option>Select File</option>
//           {files.map((f, i) => <option key={i} value={f.url}>{f.name}</option>)}
//         </select>
//       </div>
//       <div>
//         <button onClick={generateTests}>Generate Test Cases</button>
//       </div>
//       <textarea value={testCases} rows={10} cols={80} readOnly />
//       <div>
//         <button onClick={submitPR}>Create Pull Request</button>
//       </div>
//       {prUrl && <a href={prUrl} target="_blank">View Pull Request</a>}
//     </div>
//   );
// };

// export default App;

import { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [files, setFiles] = useState([]);
  const [pathStack, setPathStack] = useState(['']);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [testCases, setTestCases] = useState('');
  const [prUrl, setPrUrl] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:5000/auth/user', { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => {});
  }, []);

  const fetchRepos = async () => {
    const res = await axios.get('http://localhost:5000/api/repos', { withCredentials: true });
    setRepos(res.data);
  };

  const fetchFiles = async (repo, path = '') => {
    const res = await axios.get(`http://localhost:5000/api/files?repo=${repo}&path=${path}`, {
      withCredentials: true,
    });
    setFiles(res.data);
  };

  // const loadFileContent = async (repo, path) => {
  //   const [owner, repoName] = repo.split('/');
  //   const res = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/contents/${path}`, {
  //     headers: {
  //       Accept: 'application/vnd.github.v3.raw',
  //     },
  //   });
  //   console.log(res.data.content);
  //   setFileContent(atob(res.data.content));
  // };
const loadFileContent = async (repo, path) => {
  const [owner, repoName] = repo.split('/');

  try {
    const res = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/contents/${path}`, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
      },
    });

    console.log("Raw file content:\n", res.data); // Already decoded
    setFileContent(res.data); // No atob needed
  } catch (error) {
    console.error("Error loading file content:", error.message);
  }
};

  const navigateFolder = (folderPath) => {
    setPathStack((prev) => [...prev, folderPath]);
    fetchFiles(selectedRepo, folderPath);
  };

  const goBack = () => {
    if (pathStack.length > 1) {
      const newStack = [...pathStack];
      newStack.pop();
      setPathStack(newStack);
      fetchFiles(selectedRepo, newStack[newStack.length - 1]);
    }
  };

  const generateTests = async () => {
    const language = selectedFilePath.endsWith('.py') ? 'Python' : 'JavaScript';
    const res = await axios.post('http://localhost:5000/api/testcases', {
      code: fileContent,
      language,
    });
    setTestCases(res.data.test);
  };

  const submitPR = async () => {
    const res = await axios.post(
      'http://localhost:5000/api/create-pr',
      {
        repo: selectedRepo,
        filename: selectedFilePath.replace(/\..+$/, '').split('/').join('_'),
        testCode: testCases,
      },
      { withCredentials: true }
    );
    setPrUrl(res.data.url);
  };

  if (!user) return <a href="http://localhost:5000/auth/github">Login with GitHub</a>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome {user.username}</h2>
      <button onClick={fetchRepos}>Load Repositories</button>
      <div>
        <select
          onChange={(e) => {
            setSelectedRepo(e.target.value);
            setPathStack(['']);
            fetchFiles(e.target.value, '');
          }}
        >
          <option>Select Repo</option>
          {repos.map((r, i) => (
            <option key={i} value={r.full_name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRepo && (
        <div style={{ marginTop: 10 }}>
          <strong>📁 Current path:</strong>{' '}
          {pathStack.length > 1 && (
            <button onClick={goBack} style={{ marginRight: 8 }}>
              ⬅️ Back
            </button>
          )}
          {pathStack.join('/')}
          <ul>
            {files.folders &&
              files.folders.map((f, i) => (
                <li key={i}>
                  <button onClick={() => navigateFolder(f.path)}>📁 {f.name}</button>
                </li>
              ))}
            {files.files &&
              files.files.map((f, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      setSelectedFilePath(f.path);
                      loadFileContent(selectedRepo, f.path);
                    }}
                  >
                    📄 {f.name}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {selectedFilePath && (
        <>
          <div>
            <button onClick={generateTests}>🧠 Generate Test Cases</button>
          </div>
          <textarea value={testCases} rows={10} cols={80} readOnly />
          <div>
            <button onClick={submitPR}>🔀 Create Pull Request</button>
          </div>
        </>
      )}

      {prUrl && (
        <div style={{ marginTop: 10 }}>
          <a href={prUrl} target="_blank" rel="noopener noreferrer">
            ✅ View Pull Request
          </a>
        </div>
      )}
    </div>
  );
};

export default App;

