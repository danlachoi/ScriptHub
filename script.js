document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const resultsDiv = document.getElementById('results');
  const loadMoreButton = document.getElementById('load-more');
  const darkModeButton = document.getElementById('dark-mode-toggle');

  let currentPage = 1;

  async function fetchScripts(page = 1) {
    const searchInput = document.getElementById('search-input').value;
    const modeSelect = document.getElementById('mode-select') ? document.getElementById('mode-select').value : 'default';

    try {
      const response = await fetch(`https://scriptblox-api-proxy.vercel.app/api/search?q=${encodeURIComponent(searchInput)}&mode=${encodeURIComponent(modeSelect)}&page=${page}`);
      const data = await response.json();

      if (page === 1) {
        resultsDiv.innerHTML = '';
      }

      if (data?.result?.scripts?.length) {
        data.result.scripts.forEach(script => {
          const scriptDiv = createScriptCard(script);
          resultsDiv.appendChild(scriptDiv);
        });

        currentPage = page;
        loadMoreButton.style.display = currentPage < data.result.totalPages ? 'block' : 'none';
      } else {
        resultsDiv.innerHTML = '<p class="scripts-notfound" >No scripts found.</p>';
        loadMoreButton.style.display = 'none';
      }
    } catch (error) {
      console.error('Error fetching scripts:', error);
      resultsDiv.innerHTML = '<p class="scripts-notfound" >An error occurred while fetching scripts.</p>';
      loadMoreButton.style.display = 'none';
    }
  }

  function createScriptCard(script) {
    const scriptDiv = document.createElement('div');
    scriptDiv.classList.add('script-card');

    // Use a default image if the game image URL is not available
    const imageSrc = script.game.imageUrl ? `https://scriptblox.com${script.game.imageUrl}` : './404.jpg';
    const keyLink = script.key ? `<a href="${script.keyLink}" class="get-key-button">Get Key</a>` : 'No Key Available';

    scriptDiv.innerHTML = `
      <img src="${imageSrc}" alt="Game Image" onerror="this.src='./404.jpg';" />
      <div class="script-content-container">
        <span class="script-game">${script.game.name}</span>
        <h3 class="script-title"><a rel="noopener noreferrer">${script.title}</a></h3>
        <p class="script-game">Views: ${script.views}</p>
        <p>Key: ${keyLink}</p>
        <button class="copy-button">Copy</button>
      </div>
    `;

    const copyButton = scriptDiv.querySelector('.copy-button');
    copyButton.addEventListener('click', () => handleCopyButtonClick(script.script, copyButton)); // Pass the button element

    return scriptDiv;
  }

  function handleCopyButtonClick(scriptContent, copyButton) {
    navigator.clipboard.writeText(scriptContent)
      .then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy'; // Reset button text after a delay
        }, 2000);
      })
      .catch(err => console.error('Copy failed:', err));
  }

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    fetchScripts(1);
  });

  loadMoreButton.addEventListener('click', () => {
    fetchScripts(currentPage + 1);
  });

  function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode', !isDarkMode);
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
  }

  if (darkModeButton) {
    darkModeButton.addEventListener('click', toggleDarkMode);
  }

  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.add('light-mode');
  }

  // Initial fetch on page load
  fetchScripts(1);
});
