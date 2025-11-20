/**
 * Shared layout loader for all pages
 */
import { groupChat } from './api/api.js';

async function loadGroupChats() {
    try {
        const container = document.getElementById("groupChatCheckboxes");
        if (!container) return;

        const response = await groupChat();
        const groupChats = response.groups || [];

        container.innerHTML = ''; 

        // Load previously selected chats
        const savedSelections = JSON.parse(localStorage.getItem('selectedGroupChats') || '[]');

        groupChats.forEach(chat => {
            const id = chat.id || chat.name;
            const label = chat.name || chat.id;

            const wrapper = document.createElement("div");
            wrapper.className = "flex items-center space-x-2 text-gray-300";

            wrapper.innerHTML = `
                <input type="checkbox" 
                    class="group-checkbox w-4 h-4 accent-purple-500"
                    value="${id}" 
                    ${savedSelections.includes(id) ? 'checked' : ''} />
                <span>${label}</span>
            `;

            container.appendChild(wrapper);
        });

        // Event listener for saving selections
        container.addEventListener('change', () => {
            const selected = Array.from(
                document.querySelectorAll('.group-checkbox:checked')
            ).map(cb => cb.value);

            localStorage.setItem('selectedGroupChats', JSON.stringify(selected));
            window.dispatchEvent(new Event('groupChatChanged')); // Notify other scripts
        });

    } catch (error) {
        console.error('Failed to load group chats:', error);
    }
}


// Helper function to get selected group chat (can be called from any page)
window.getSelectedGroupChats = function () {
    return JSON.parse(localStorage.getItem('selectedGroupChats') || '[]');
};


async function loadLayout(pageId) {
    try {
        // All pages are now in the frontend folder, so use relative path
        const layoutPath = './src/components/layout.html';

        // Load layout template
        const layoutHTML = await fetch(layoutPath).then(res => res.text());
        document.getElementById('layout').innerHTML = layoutHTML;

        // Fix navigation links
        fixNavigationLinks();

        // Set active tab based on current page
        setActiveTab(pageId);
       
        // Load group chats into selector
        await loadGroupChats();
    } catch (error) {
        console.error('Failed to load layout:', error);
    }
}

function fixNavigationLinks() {
    // Get all tab links
    const tabLinks = document.querySelectorAll('.tab-link');

    tabLinks.forEach(link => {
        const page = link.getAttribute('data-page');

        if (page === 'brand') {
            // Brand tab goes to index.html in the frontend folder
            link.href = 'index.html';
        } else {
            // Other tabs go to their respective files in the frontend folder
            const filename = {
                'time': 'tab2_time.html',
                'sov': 'tab3_sov.html',
                'general': 'tab4_general.html',
                'cp': 'tab5_cp.html'
            }[page];

            link.href = filename;
        }
    });
}

function setActiveTab(pageId) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.classList.remove('tab-active');
    });

    // Add active class to current tab
    const currentTab = document.querySelector(`a[data-page="${pageId}"]`);
    if (currentTab) {
        currentTab.classList.add('tab-active');
    }
}

// Export for ES6 modules and make available globally
export { loadLayout };
window.loadLayout = loadLayout;
