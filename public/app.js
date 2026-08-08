document.addEventListener('DOMContentLoaded', () => {
    const roleSelect = document.getElementById('roleSelect');
    const uploadForm = document.getElementById('uploadForm');
    const fileDropArea = document.getElementById('fileDropArea');
    const resumeFileInput = document.getElementById('resumeFile');
    const fileMsg = document.querySelector('.file-msg');
    
    // UI States
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const resultsSection = document.getElementById('resultsSection');
    const scanAnotherBtn = document.getElementById('scanAnotherBtn');
    
    // Fetch Roles on load
    fetch('/api/roles')
        .then(response => response.json())
        .then(data => {
            roleSelect.innerHTML = '';
            if (data.roles && data.roles.length > 0) {
                data.roles.forEach(role => {
                    const option = document.createElement('option');
                    option.value = role;
                    option.textContent = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    roleSelect.appendChild(option);
                });
            } else {
                roleSelect.innerHTML = '<option disabled>No roles available</option>';
            }
        })
        .catch(err => {
            console.error('Failed to load roles:', err);
            roleSelect.innerHTML = '<option disabled>Failed to load roles</option>';
        });

    // File Drop UI
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, () => {
            fileDropArea.classList.add('is-active');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, () => {
            fileDropArea.classList.remove('is-active');
        }, false);
    });

    fileDropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            resumeFileInput.files = files;
            updateFileMessage();
        }
    });

    resumeFileInput.addEventListener('change', updateFileMessage);

    function updateFileMessage() {
        if (resumeFileInput.files.length > 0) {
            fileMsg.textContent = resumeFileInput.files[0].name;
            fileMsg.style.color = 'var(--primary-color)';
            fileMsg.style.fontWeight = '600';
        } else {
            fileMsg.textContent = 'Drag & drop a PDF here or click to browse';
            fileMsg.style.color = '';
            fileMsg.style.fontWeight = '';
        }
    }

    // Form Submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!resumeFileInput.files || resumeFileInput.files.length === 0) {
            alert('Please select a PDF file first.');
            return;
        }

        const formData = new FormData();
        formData.append('resume', resumeFileInput.files[0]);
        formData.append('role', roleSelect.value);

        // Update UI for loading
        setLoadingState(true);

        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to evaluate resume');
            }

            renderResults(data);
            setLoadingState(false, true);
        } catch (error) {
            console.error(error);
            showError(error.message);
            setLoadingState(false, false);
        }
    });

    document.getElementById('retryBtn').addEventListener('click', () => {
        errorState.classList.add('hidden');
        document.querySelector('.upload-section').style.display = 'block';
    });

    function setLoadingState(isLoading, success = false) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Evaluating...';
            spinner.classList.remove('hidden');
            document.querySelector('.upload-section').style.display = 'none';
            loadingState.classList.remove('hidden');
            resultsSection.classList.add('hidden');
            errorState.classList.add('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Evaluate Resume';
            spinner.classList.add('hidden');
            loadingState.classList.add('hidden');
            
            if (success) {
                resultsSection.classList.remove('hidden');
            }
        }
    }

    function showError(msg) {
        document.getElementById('errorMsg').textContent = msg;
        errorState.classList.remove('hidden');
    }

    function renderResults(data) {
        // Calculate Total Score
        let totalScore = 0;
        let maxScore = 0;
        
        const categoriesList = document.getElementById('categoriesList');
        categoriesList.innerHTML = '';

        if (data.scores) {
            for (const [key, category] of Object.entries(data.scores)) {
                let catScore = category.score;
                if (catScore > category.max) catScore = category.max;
                
                totalScore += catScore;
                maxScore += category.max;

                const catName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                categoriesList.innerHTML += `
                    <div class="category-card">
                        <div class="cat-head">
                            <span class="cat-name">${catName}</span>
                            <span class="cat-score">${catScore}/${category.max}</span>
                        </div>
                        <div class="cat-evidence">${category.evidence}</div>
                    </div>
                `;
            }
        }

        // Apply Bonus / Deductions
        let bonusTotal = 0;
        let deducTotal = 0;

        if (data.bonus_points && data.bonus_points.total) {
            bonusTotal = data.bonus_points.total;
            totalScore += bonusTotal;
        }

        if (data.deductions && data.deductions.total) {
            deducTotal = data.deductions.total;
            totalScore -= deducTotal;
        }

        // Update top-level scores
        document.getElementById('overallScore').textContent = Math.max(0, parseFloat(totalScore).toFixed(1));
        document.getElementById('bonusPoints').textContent = bonusTotal;
        document.getElementById('deductionPoints').textContent = deducTotal;

        // Strengths & Improvements
        const strengthsList = document.getElementById('strengthsList');
        strengthsList.innerHTML = '';
        if (data.key_strengths && data.key_strengths.length > 0) {
            data.key_strengths.forEach(s => {
                strengthsList.innerHTML += `<li>${s}</li>`;
            });
        } else {
            strengthsList.innerHTML = '<li>None identified.</li>';
        }

        const improvementsList = document.getElementById('improvementsList');
        improvementsList.innerHTML = '';
        if (data.areas_for_improvement && data.areas_for_improvement.length > 0) {
            data.areas_for_improvement.forEach(a => {
                improvementsList.innerHTML += `<li>${a}</li>`;
            });
        } else {
            improvementsList.innerHTML = '<li>None identified.</li>';
        }
    }

    if(scanAnotherBtn) {
        scanAnotherBtn.addEventListener('click', () => {
            uploadForm.reset();
            resultsSection.classList.add('hidden');
            document.querySelector('.upload-section').style.display = 'block';
            fileMsg.textContent = 'Drag & drop a PDF here or click to browse';
            fileMsg.style.color = '';
            fileMsg.style.fontWeight = '';
        });
    }
});
