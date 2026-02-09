// Page navigation with content loading
        const navLinks = document.querySelectorAll('.nav-link');
        const pageTitle = document.getElementById('pageTitle');
        const pageContents = document.querySelectorAll('.page-content');
        
        const pageConfig = {
            dashboard: {
                title: 'All articles',
                file: null
            },
            article: {
                title: 'My Article',
                file: '../article_page/article_create.html'
            },
            category: {
                title: 'Category',
                file: '../category_page/category.html'
            }
            
        };
        

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                
                if (page === 'logout') {
                    window.location.href = '../auth_page/logout.html';
                    return;
                }

                // Hide all pages
                pageContents.forEach(content => {
                    content.classList.add('d-none');
                });

                // Show selected page
                const selectedPage = document.getElementById(`page-${page}`);
                if (selectedPage) {
                    selectedPage.classList.remove('d-none');
                }

                // Update title
                pageTitle.textContent = pageConfig[page].title || 'Dashboard';

                // Load content from file
                if (pageConfig[page].file) {
                    fetch(pageConfig[page].file)
                        .then(response => response.text())
                        .then(html => {
                            selectedPage.innerHTML = html;
                        })
                        .catch(error => {
                            selectedPage.innerHTML = '<div class="alert alert-danger">Error loading page</div>';
                            console.error('Error loading page:', error);
                        });
                }

                // Update active link styling
                navLinks.forEach(l => {
                    l.style.background = 'transparent';
                    l.classList.remove('text-white');
                    l.classList.add('text-white-50');
                });
                link.style.background = 'rgba(255, 255, 255, 0.1)';
                link.classList.remove('text-white-50');
                link.classList.add('text-white');

                // Close sidebar on mobile
                const sidebar = document.getElementById('sidebar');
                if (window.innerWidth < 992) {
                    sidebar.classList.remove('show');
                }
            });
        });

        // Sidebar toggle
        const toggleBtn = document.getElementById('toggleBtn');
        const sidebar = document.getElementById('sidebar');

        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });

        document.addEventListener('click', function(event) {
            if (window.innerWidth < 992) {
                if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });