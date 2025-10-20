document.addEventListener('DOMContentLoaded', () => {
    const terminalContainer = document.getElementById('terminal-container');
    const outputElement = document.getElementById('output');
    const terminalBanner = document.getElementById('terminal-banner');

    // Store the time the page loaded for uptime calculation
    const pageLoadTime = new Date();

    // --- Core Logic for Showing/Hiding Terminal ---
    terminalContainer.classList.remove('hidden');

    // --- Hidden input for accessibility/copy-paste/mobile focus ---
    const hiddenInput = document.createElement('input');
    hiddenInput.style.position = 'fixed';
    hiddenInput.style.left = '-9999px';
    hiddenInput.style.top = '-9999px';
    hiddenInput.style.opacity = '0';
    hiddenInput.setAttribute('type', 'text');
    hiddenInput.setAttribute('autocomplete', 'off');
    hiddenInput.setAttribute('spellcheck', 'false');
    terminalContainer.appendChild(hiddenInput);

    // Initial focus on load
    hiddenInput.focus();

    // --- New helper function to ensure hiddenInput always has focus ---
    function ensureHiddenInputFocused() {
        // Only focus if not already focused and not in shutdown state
        if (document.activeElement !== hiddenInput && !document.getElementById('sudo-shutdown-message')) {
            hiddenInput.focus();
        }
    }


    // --- Terminal State Variables ---
    let currentInput = ""; // Holds the text the user is currently typing
    let inputHistory = []; // For Up/Down arrow key functionality
    let historyPointer = -1; // Pointer for history
    let isTyping = false; // Flag to control typing effect

    let isWaitingForPassword = false;
    let sudoCommandPending = '';
    const SUDO_PASSWORD = "902581"; // !!! YOUR SUDO PASSWORD !!! - CHANGE THIS!
    let isAuthenticatedSudoSession = false; // NEW: Tracks if sudo session is active


    console.log(`%cPassword: ${SUDO_PASSWORD}`, 'color: red; font-size: 20px; font-weight: bold;');


    let isGameActive = false;
    let secretNumber = 0;
    let guessesLeft = 5;
    const GAME_MAX_NUMBER = 20;

    let currentDirectory = '/'; // Current directory for simulated file system


    // =========================================================================
    // === YOUR CONTENT IS NOW STYLED WITH COLORS ==============================
    // =========================================================================
    const fileSystem = {
        '/': {
            type: 'directory',
            contents: {
                'about.txt': {
                    type: 'file',
                    content: `
<span class="content-title">Purva Nalawade - Cybersecurity & AI Enthusiast</span>
<span class="content-tech">Cybersecurity & AI Enthusiast | Red Team Intern at DeepCytes | B.Tech in Cybersecurity, SAKEC (2027)</span>

Hi, I’m Purva Nalawade, a passionate cybersecurity and AI enthusiast currently pursuing a B.Tech in Cybersecurity from Shah & Anchor Kutchhi Engineering College (SAKEC), Mumbai.

I specialize in red teaming, ethical hacking, and AI-assisted threat detection, and I’m currently interning as a Red Team Intern at DeepCytes.

My experience spans across hackathons, CTFs, internships, and research projects focusing on phishing detection, CCTV infrastructure security, and full-stack development.

I aim to build a career in cyber threat intelligence and offensive security, combining technical depth with real-world impact.
`
                },
                'education.txt': {
                    type: 'file',
                    content: `
<span class="content-title">EDUCATION</span>
  - Shah and Anchor Kutchhi Engineering College (2023 - Present)
  - Peoples Education Society (2021 - 2023)
  - Holy Cross Convent High School (2015 - 2021)
`
                },
                'skills.txt': {
                    type: 'file',
                    content: `
<span class="content-title">SKILLS</span>
  <span class="content-header">Programming:</span> <span class="content-tech">C, Python, Bash, SQL</span>
  <span class="content-header">Platforms & OS:</span> <span class="content-tech">Linux, Windows</span>
  <span class="content-header">Tools & Security:</span> <span class="content-tech">Wireshark, Metasploit, Nmap, Git & GitHub, Autopsy</span>
  <span class="content-header">Web Development:</span> <span class="content-tech">HTML, CSS, JavaScript, Next.js, React</span>
  <span class="content-header">Cybersecurity & AI:</span> <span class="content-tech">Red Teaming, Ethical Hacking (CEH), Network Security, IDS/IPS, Threat Intelligence, OSINT, Digital Forensics, AI in Cybersecurity</span>
  <span class="content-header">Soft Skills:</span> <span class="content-tech">Teamwork, Communication, Leadership, Adaptability, Problem-Solving, Time Management</span>
`
                },
                'contact.txt': {
                    type: 'file',
                    content: `
<span class="content-title">CONTACT</span>
  <span class="content-header">Location:</span> Mumbai, India
  <span class="content-header">Email:</span> purva.17737@sakec.ac.in
  <span class="content-header">GitHub:</span> https://github.com/Nalawade-Purva
  <span class="content-header">LinkedIn:</span> https://www.linkedin.com/in/purva-nalawade-532921315/
`
                },
                'certifications.txt': {
                    type: 'file',
                    content: `
<span class="content-title">CERTIFICATIONS</span>
--------------------------------------------------------------------------------
<span class="command-highlight">Certified in Cybersecurity (CC) — ISC²</span>
  - <span class="content-header">Issued by:</span> ISC²
  - <span class="content-header">Date:</span> June 2025
  - <span class="content-header">Description:</span> Earned the globally recognized Certified in Cybersecurity (CC) credential, validating fundamental knowledge in information security principles, network security, incident response, and security operations.
  - <span class="content-header">Skills Covered:</span> <span class="content-tech">Cybersecurity Concepts, Access Control, Network Security, Security Operations, Risk Management</span>

--------------------------------------------------------------------------------
<span class="command-highlight">Certified Ethical Hacker (CEH) — EC-Council</span>
  - <span class="content-header">Issued by:</span> EC-Council
  - <span class="content-header">Date:</span> July 2025
  - <span class="content-header">Description:</span> Demonstrated advanced understanding of ethical hacking methodologies, penetration testing, and exploit analysis. Achieved a score of 118 in the CEH examination.
  - <span class="content-header">Skills Covered:</span> <span class="content-tech">Penetration Testing, Vulnerability Assessment, Exploit Development, Malware Analysis, Network Defense</span>

--------------------------------------------------------------------------------
<span class="command-highlight">TryHackMe Certifications</span>
  - <span class="content-header">Issued by:</span> TryHackMe
  - <span class="content-header">Certificates:</span> Web Fundamentals & Junior Penetration Tester
  - <span class="content-header">Description:</span> Hands-on training in ethical hacking, web exploitation, and security assessment through interactive labs and real-world attack simulations.
  - <span class="content-header">Skills Covered:</span> <span class="content-tech">Web Security, Penetration Testing, Reconnaissance, Vulnerability Exploitation</span>

--------------------------------------------------------------------------------
<span class="command-highlight">Zscaler Virtual Internship Certificate</span>
  - <span class="content-header">Issued by:</span> Zscaler (via AICTE Virtual Internship Program)
  - <span class="content-header">Description:</span> Completed a virtual internship focusing on Zero Trust architecture, cloud security, and secure access service edge (SASE) models.
  - <span class="content-header">Skills Covered:</span> <span class="content-tech">Zero Trust, Cloud Security, Web Gateway Protection</span>

--------------------------------------------------------------------------------
<span class="command-highlight">Palo Alto Networks Cybersecurity Fundamentals — AICTE</span>
  - <span class="content-header">Issued by:</span> Palo Alto Networks (via AICTE Virtual Internship Program)
  - <span class="content-header">Description:</span> Completed a cybersecurity fundamentals course focusing on network defense, threat identification, and cloud security awareness.
  - <span class="content-header">Skills Covered:</span> <span class="content-tech">Firewall Configuration, Threat Management, Cloud Security, Network Defense</span>

--------------------------------------------------------------------------------
<span class="command-highlight">Fortinet Certified Associate (FCA) & Fortinet Certified Fundamentals (FCF)</span>
  - <span class="content-header">Issued by:</span> Fortinet (via AICTE Virtual Internship Program)
  - <span class="content-header">Description:</span> Gained expertise in cybersecurity fundamentals, network security concepts, and the use of Fortinet Security Fabric tools through a structured virtual internship program.
  - <span class="content-header">Skills Covered:</span> <span class="content-tech">FortiGate Configuration, Threat Mitigation, Secure Network Design</span>
`
                },
                'extracurricular.txt': {
                    type: 'file',
                    content: `
<span class="content-title">EXTRACURRICULAR ACTIVITIES</span>
--------------------------------------------------------------------------------
<span class="command-highlight">Events Head - Ek Bharat Shreshtha Bharat (EBSB) Club SAKEC</span>
  <span class="content-bullet">*</span> Headed the Events Team for cultural and technical exchange programs.
  <span class="content-bullet">*</span> Organized inter-college competitions promoting national integration and collaboration.

<span class="command-highlight">Events Lead - Cyber Council, University</span>
  <span class="content-bullet">*</span> Led and organized multiple cybersecurity awareness sessions, competitions.
  <span class="content-bullet">*</span> Coordinated with industry experts to host guest lectures and student workshops.
  <span class="content-bullet">*</span> Managed event logistics, marketing, and student engagement activities.

<span class="command-highlight">Editorial Team - Intelligent Forensic (Published Book)</span>
  <span class="content-bullet">*</span> Contributed to the editorial and review process of a published book on digital forensics.
  <span class="content-bullet">*</span> Gained experience in technical writing, proofreading, and content structuring for research publication.

<span class="command-highlight">Hackathon Participation</span>
  <span class="content-bullet">*</span> Idea Hackathon (Top 10 Finalist) - Phishers Project
  <span class="content-bullet">*</span> CCTV Surveillance Security & Forensics Hackathon 2.0 (Consolation Winner) - Harden the Grid Project

<span class="command-highlight">CTF Participation</span>
  <span class="content-bullet">*</span> Participated in multiple cybersecurity CTF challenges.
  <span class="content-bullet">*</span> Specialized in web exploitation, network forensics, and OSINT-based challenges.
  <span class="content-bullet">*</span> Solved challenges involving Nmap scans, brute-force, sniffing, replay attacks, and privilege escalation.

<span class="command-highlight">Tech Communities & Clubs</span>
  <span class="content-bullet">*</span> Operational Team Member, Google Developer Student Clubs (GDSC) - Contributed to the planning and execution of technical events and community initiatives.
  <span class="content-bullet">*</span> Technical Team Member, Cyber Council - Supported cybersecurity workshops, awareness sessions, and technical competitions.
`
                },
                'internships': {
                    type: 'directory',
                    contents: {
                        'deepcytes_redteam.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Red Team Intern — DeepCytes Cyber Labs (July 2025 – Present)</span>
  - <span class="content-header">Description:</span> Currently working as a Red Team Intern at DeepCytes, focusing on offensive security assessments, vulnerability exploitation, and adversary simulation. The internship emphasizes advanced red teaming methodologies, threat intelligence, and reporting.
  - <span class="content-header">Key Highlights:</span>
    <span class="content-bullet">*</span> Perform penetration testing and red team exercises on simulated enterprise environments.
    <span class="content-bullet">*</span> Use tools like Burp Suite, Nmap, Metasploit, and Wireshark for reconnaissance and exploitation.
    <span class="content-bullet">*</span> Contribute to internal research and automation of attack simulation scripts.
    <span class="content-bullet">*</span> Collaborate with fellow interns on advanced threat modeling and OSINT-driven reconnaissance.
  - <span class="content-header">Skills Gained:</span> <span class="content-tech">Red Teaming, Penetration Testing, Threat Intelligence, OSINT, Network Security</span>
  - <span class="content-header">Location:</span> Remote / Hybrid
  - <span class="content-header">Status:</span> Ongoing
`
                        },
                        'millennium_fullstack.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Full Stack Development Intern — Millennium Enterprise (March 2025 – June 2025)</span>
  - <span class="content-header">Description:</span> Completed a 3-month internship at Millennium Enterprise, where I designed and developed dynamic web applications using the MERN stack. The internship provided practical exposure to front-end and back-end development, version control, and deployment.
  - <span class="content-header">Key Highlights:</span>
    <span class="content-bullet">*</span> Built responsive web interfaces with HTML, CSS, JavaScript, React, and Node.js.
    <span class="content-bullet">*</span> Developed secure REST APIs and integrated them with MongoDB databases.
    <span class="content-bullet">*</span> Worked in an agile team environment, following SDLC principles from design to deployment.
    <span class="content-bullet">*</span> Enhanced understanding of UI/UX principles and web security best practices.
  - <span class="content-header">Skills Gained:</span> <span class="content-tech">Full Stack Development, MERN Stack, REST APIs, Git & GitHub, Web Security</span>
  - <span class="content-header">Location:</span> Remote / Hybrid
  - <span class="content-header">Status:</span> Completed
`
                        }
                    }
                },
                'projects': {
                    type: 'directory',
                    contents: {
                        'phishers.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Phishers - Phishing URL Detection & Automated Takedown Coordination</span>
  - <span class="content-header">Award:</span> Hackathon Finalist (Top 10) - Idea Hackathon
  - <span class="content-header">Description:</span> Developed a centralized platform to detect and coordinate the takedown of phishing domains targeting public sector banks. The solution integrates AI-based phishing detection, real-time reporting, and global registrar coordination to streamline cross-jurisdictional takedown efforts and reduce response time.
  - <span class="content-header">Tools & Technologies:</span> <span class="content-tech">Python, Flask, scikit-learn, WHOIS/DNS lookups, Passive DNS, AbuseIPDB API, OTX Threat Feeds, Celery, Redis, GitHub</span>
`
                        },
                        'harden-the-grid.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Harden the Grid: Cyber Defence for CCTV Infrastructure</span>
  - <span class="content-header">Award:</span> Consolation Prize Winner (Top 10) - CCTV Surveillance Security and Forensics Hackathon 2.0
  - <span class="content-header">Description:</span> Designed a multi-layered cybersecurity architecture to protect CCTV networks against hacking and data breaches. The solution emphasizes encrypted transmission, role-based access, zero-trust security, and real-time threat detection using IDS/IPS and threat intelligence feeds.
  - <span class="content-header">Tools & Technologies:</span> <span class="content-tech">Flask, nginx (NVR), WireGuard, TLS/HTTPS, Keycloak (RBAC/MFA/Zero-Trust), Suricata (IDS/IPS), AbuseIPDB (Threat Feeds), Nmap</span>
`
                        },
                        'book-recommender.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Book Recommendation System</span>
  - <span class="content-header">Description:</span> Built a personalized book recommendation system that suggests titles based on user preferences and book similarities. The model uses both collaborative and content-based filtering to enhance recommendation accuracy and user engagement.
  - <span class="content-header">Tools & Technologies:</span> <span class="content-tech">Python, pandas, scikit-learn, NumPy, Streamlit/Flask (UI), Cosine Similarity, Collaborative Filtering</span>
`
                        },
                        'swiss-army-knife.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Swiss Army Knife - Multi-Purpose Cybersecurity Utility Tool</span>
  - <span class="content-header">Description:</span> Developed a multi-utility cybersecurity toolkit that integrates several common offensive and defensive features into a single interface — functioning as a “Swiss Army Knife” for security testing, reconnaissance, and quick incident response.
  - <span class="content-header">Tools & Technologies:</span> <span class="content-tech">Python, Flask/Tkinter, Requests, Socket, OSINT APIs, Nmap, Hashlib, Cryptography Libraries</span>
`
                        }
                    }
                },
                'blogs': {
                    type: 'directory',
                    contents: {
                        'project-management.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Project Management in Software Engineering</span>
  - <span class="content-header">Platform:</span> GitHub
  - <span class="content-header">Description:</span> Authored an insightful article exploring key principles of Software Engineering and Project Management (SEMP) — covering planning, execution, risk management, and effective collaboration in project lifecycles.
  - <span class="content-header">Link:</span> https://github.com/Nalawade-Purva/project-management-articles
`
                        },
                        'cyber-forensics.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Cyber Crime Investigation & Digital Forensics</span>
  - <span class="content-header">Platform:</span> GitHub
  - <span class="content-header">Description:</span> Authored a detailed article based on the “Cyber Security 101” learning path on TryHackMe — covering core cybersecurity fundamentals including confidentiality, integrity, and availability (CIA triad), threat types, attack vectors, and essential defense mechanisms. The article provides insights into practical concepts like malware analysis, network security basics, social engineering awareness, and security best practices for individuals and organizations.
  - <span class="content-header">Link:</span> https://github.com/Nalawade-Purva/cybersecurity-101-article
`
                        }
                    }
                },
                'resume.pdf': {
                    type: 'file',
                    content: `
Resume:
Download from: https://sites.google.com/sakec.ac.in/purva-nalawade/resume
`
                }
            }
        }
    };


    // --- Persistent Terminal Content on Clear/Load ---
    const TERMINAL_PERSISTENT_CONTENT = `
██████  ██    ██ ██████  ██    ██  █████  
██   ██ ██    ██ ██   ██ ██    ██ ██   ██ 
██████  ██    ██ ██████  ██    ██ ███████ 
██      ██    ██ ██   ██  ██  ██  ██   ██ 
██       ██████  ██   ██   ████   ██   ██ 
                  
  
Welcome to Purva's Terminal Portfolio!
Type 'help' for a list of commands, or 'ls' to explore the file system.
`;

    let terminalContent = TERMINAL_PERSISTENT_CONTENT; // Holds all permanent output


    // --- Get Current Prompt Text (now with distinct spans for styling) ---
    function getPrompt() {
        return `<span class="prompt-user">guest</span><span class="prompt-at">@</span><span class="prompt-host">myportfolio.xyz</span>:<span class="prompt-dir">${currentDirectory}</span><span class="prompt-dollar">$</span>`;
    }

    // --- Get Content from Simulated File System ---
    function getPathContent(path) {
        let parts = path.split('/').filter(p => p !== ''); // Split by /, remove empty parts
        let currentNode = fileSystem['/'];

        if (path === '/') return currentNode; // Handle root directly

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!currentNode || currentNode.type !== 'directory' || !currentNode.contents[part]) {
                return null; // Path not found
            }
            currentNode = currentNode.contents[part];
        }
        return currentNode;
    }

    // --- Banner Update Logic ---
    function updateBanner() {
        if (!terminalBanner) return;

        const now = new Date();
        const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

        const dateStr = now.toLocaleDateString('en-US', dateOptions);
        const timeStr = now.toLocaleTimeString('en-US', timeOptions);

        terminalBanner.innerHTML = `
            <span class="banner-left">guest@myportfolio.xyz</span>
            <span class="banner-right">${dateStr} ${timeStr}</span>
        `;
    }

    // Call once immediately and then update every second
    updateBanner();
    const bannerInterval = setInterval(updateBanner, 1000); // Store interval ID to clear later


    // --- Function to Render Current Prompt and Input ---
    function renderPromptAndInput() {
        const isScrolledToBottomBeforeRender =
            terminalContainer.scrollHeight - terminalContainer.clientHeight <= terminalContainer.scrollTop + 50;

        let displayInput = currentInput;
        if (isWaitingForPassword) {
            displayInput = '*'.repeat(currentInput.length);
        }

        outputElement.innerHTML = terminalContent + `<span class="prompt">${getPrompt()}</span> ${displayInput}<span class="caret">█</span>`;

        if (isScrolledToBottomBeforeRender) {
            terminalContainer.scrollTop = terminalContainer.scrollHeight;
        }
        ensureHiddenInputFocused();
    }

    // --- Typing Effect for Output ---
    async function typeOutput(text, speed = 5) {
        if (isTyping) return;
        isTyping = true;

        terminalContent += `<span class="prompt">${getPrompt()}</span> ${isWaitingForPassword ? '*'.repeat(currentInput.length) : currentInput}\n`;
        currentInput = "";

        let typedTextBuffer = '';
        for (let i = 0; i < text.length; i++) {
            typedTextBuffer += text[i];
            outputElement.innerHTML = terminalContent + typedTextBuffer + `<span class="caret">█</span>`;
            terminalContainer.scrollTop = terminalContainer.scrollHeight;
            await new Promise(r => setTimeout(r, speed));
        }

        terminalContent += text + '\n';
        isTyping = false;
        renderPromptAndInput();
        ensureHiddenInputFocused();
    }

    // --- Paste Event Handler ---
    document.addEventListener('paste', (event) => {
        event.preventDefault();
        const pasteData = (event.clipboardData || window.clipboardData).getData('text');
        currentInput += pasteData;
        renderPromptAndInput();
    });

    // --- Keyboard Input Handling ---
    document.addEventListener('keydown', async (event) => {
        // Allow browser shortcuts (Ctrl+C, Ctrl+V, etc.)
        if (event.ctrlKey || event.metaKey) {
            return;
        }

        if (document.getElementById('sudo-shutdown-message') || isTyping) {
            event.preventDefault();
            return;
        }

        // Prevent default browser action for keys we handle
        if (['Backspace', 'Enter', 'ArrowUp', 'ArrowDown', 'Tab'].includes(event.key)) {
            event.preventDefault();
        }

        if (event.key === 'Enter') {
            const command = currentInput.trim();
            if (command && !isWaitingForPassword) {
                inputHistory.push(command);
                historyPointer = inputHistory.length;
            }

            if (isWaitingForPassword) {
                await handlePasswordInput(command);
            } else if (isGameActive) {
                await handleGameInput(command);
            } else {
                await processCommand(command.toLowerCase());
            }

        } else if (event.key === 'Backspace') {
            currentInput = currentInput.slice(0, -1);
        } else if (event.key === 'ArrowUp') {
            if (inputHistory.length > 0) {
                if (historyPointer === inputHistory.length) {
                    historyPointer = inputHistory.length - 1;
                } else if (historyPointer > 0) {
                    historyPointer--;
                }
                currentInput = inputHistory[historyPointer];
            }
        } else if (event.key === 'ArrowDown') {
            if (inputHistory.length > 0) {
                if (historyPointer < inputHistory.length - 1) {
                    historyPointer++;
                    currentInput = inputHistory[historyPointer];
                } else {
                    historyPointer = inputHistory.length;
                    currentInput = '';
                }
            }
        } else if (event.key.length === 1) {
            currentInput += event.key;
        }

        renderPromptAndInput();
    });

    
    // --- NEW: Function to trigger a file download ---
    function downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    // --- Function to Process Commands ---
    async function processCommand(command) {
        let response = '';
        const args = command.split(' ').filter(arg => arg !== '');
        const baseCommand = args[0];

        if (baseCommand === 'sudo') {
            const sudoTargetCommand = args.slice(1).join(' ');

            if (isAuthenticatedSudoSession) {
                if (sudoTargetCommand === 'game') {
                    response += await startGame();
                } else if (sudoTargetCommand === 'rm -rf /*') {
                    response = `<span class="command-highlight">Executing privileged command...</span>\n`;
                    await typeOutput(response);
                    await executeSudoRmRfStar();
                    return;
                } else if (sudoTargetCommand === '') {
                    response = `
<span class="warning-message">Usage: sudo [command]</span>
You are currently authenticated.
Available sudo commands:
  <span class="command-highlight">sudo game</span>     - Start a small terminal game.
  <span class="command-highlight">sudo rm -rf /*</span> - <span class="error-message">Proceed with extreme caution. This command simulates system termination.</span>
`;
                } else {
                    response = `<span class="error-message">sudo: ${sudoTargetCommand}: command not found.</span>\n`;
                }
                await typeOutput(response);
                return;
            } else {
                isWaitingForPassword = true;
                sudoCommandPending = sudoTargetCommand;
                response = `Password for guest: `;
                await typeOutput(response);
                return;
            }
        } else if (isGameActive) {
            response = "Please make a guess or type 'exit' to quit the game.\n";
            await typeOutput(response);
            return;
        } else {
            switch (baseCommand) {
                case 'help':
                    response = `
Available commands:
  <span class="command-highlight">help</span>            - Display this help message

  <span class="command-highlight">whoami</span>          - Learn about Purva (equivalent to 'cat /about.txt')
  <span class="command-highlight">skills</span>          - View my technical skills (equivalent to 'cat /skills.txt')
  <span class="command-highlight">projects</span>        - See my work (equivalent to 'ls /projects')
  <span class="command-highlight">internships</span>     - View my internship experiences (equivalent to 'ls /internships')
  <span class="command-highlight">blogs</span>           - Read my articles (equivalent to 'ls /blogs')
  <span class="command-highlight">certifications</span>  - See my earned certifications (equivalent to 'cat /certifications.txt')
  <span class="command-highlight">education</span>       - View my academic background (equivalent to 'cat /education.txt')
  <span class="command-highlight">extracurricular</span> - Explore my activities outside academics (equivalent to 'cat /extracurricular.txt')
  <span class="command-highlight">contact</span>         - Get in touch (equivalent to 'cat /contact.txt')
  <span class="command-highlight">resume</span>          - Get my resume (equivalent to 'cat /resume.pdf')

  <span class="command-highlight">ls</span>              - List directory contents (e.g., ls, ls /projects)
  <span class="command-highlight">dir</span>             - List directory contents (alias for 'ls')
  <span class="command-highlight">cd</span>              - Change directory (e.g., cd projects, cd .., cd /)
  <span class="command-highlight">cat</span>             - Display file contents (e.g., cat about.txt)
  <span class="command-highlight">clear</span>           - Clear the terminal screen
  <span class="command-highlight">echo</span>            - Repeat your input (e.g., echo hello world)
  <span class="command-highlight">theme</span>           - Change the terminal theme (e.g., theme light, theme dark, theme blue, theme red)
  <span class="command-highlight">sudo</span>            - ?
`;
                    break;
                case 'whoami':
                    return await processCommand('cat /about.txt');
                case 'education':
                    return await processCommand('cat /education.txt');
                case 'skills':
                    return await processCommand('cat /skills.txt');
                case 'certifications':
                    return await processCommand('cat /certifications.txt');
                case 'projects':
                    return await processCommand('ls /projects');
                case 'extracurricular':
                    return await processCommand('cat /extracurricular.txt');
                case 'internships':
                    return await processCommand('ls /internships');
                case 'blogs':
                    return await processCommand('ls /blogs');
                case 'contact':
                    return await processCommand('cat /contact.txt');
                
                // MODIFIED: 'resume' command now shows a message and triggers a download
                case 'resume':
                    response = `
<span class="command-highlight">Fetching the latest version of my resume...</span>
You're one step closer to hiring your next cybersecurity star! The download will begin shortly.
`;
                    await typeOutput(response);
                    
                    // Wait a moment before starting the download
                    setTimeout(() => {
                        // Extract the URL from the fileSystem content for 'resume.pdf'
                        const resumeFileContent = fileSystem['/']['contents']['resume.pdf']['content'];
                        const urlMatch = resumeFileContent.match(/(https?:\/\/[^\s]+)/); // Regex to find a URL
                        const resumeDownloadUrl = urlMatch ? urlMatch[0] : 'Purva_Nalawade_Resume.pdf'; // Fallback to local name if URL not found

                        downloadFile(resumeDownloadUrl, 'Purva_Nalawade_Resume.pdf');
                    }, 1000); // 1-second delay
                    return; // Exit here since we don't want to call typeOutput again

                case 'ls':
                case 'dir':
                    let targetPathLs = args[1] || currentDirectory;
                    let targetNodeLs = getPathContent(targetPathLs);

                    if (!targetNodeLs) {
                        response = `<span class="error-message">${baseCommand}: cannot access '${targetPathLs}': No such file or directory</span>\n`;
                    } else if (targetNodeLs.type === 'file') {
                        response = `<span class="error-message">${baseCommand}: cannot access '${targetPathLs}': Not a directory</span>\n`;
                    } else {
                        const contents = Object.keys(targetNodeLs.contents).sort();
                        if (contents.length === 0) {
                            response = `(empty directory)\n`;
                        } else {
                            response = contents.map(item => {
                                const node = targetNodeLs.contents[item];
                                return node.type === 'directory' ? `<span class="ls-directory">${item}/</span>` : `<span class="ls-file">${item}</span>`;
                            }).join('   ') + '\n';
                        }
                    }
                    break;
                case 'cd':
                    let targetPathCd = args[1];
                    if (!targetPathCd) {
                        currentDirectory = '/';
                        response = '';
                    } else if (targetPathCd === '..') {
                        const pathParts = currentDirectory.split('/').filter(p => p !== '');
                        if (pathParts.length > 0) {
                            pathParts.pop();
                            currentDirectory = '/' + pathParts.join('/');
                            if (currentDirectory === '') currentDirectory = '/';
                        }
                        response = '';
                    } else if (targetPathCd.startsWith('/')) {
                        let targetNode = getPathContent(targetPathCd);
                        if (targetNode && targetNode.type === 'directory') {
                            currentDirectory = targetPathCd;
                        } else {
                            response = `<span class="error-message">cd: no such file or directory: ${targetPathCd}</span>\n`;
                        }
                    } else {
                        let fullPath = currentDirectory === '/' ? `/${targetPathCd}` : `${currentDirectory}/${targetPathCd}`;
                        let targetNode = getPathContent(fullPath);
                        if (targetNode && targetNode.type === 'directory') {
                            currentDirectory = fullPath;
                        } else {
                            response = `<span class="error-message">cd: no such file or directory: ${targetPathCd}</span>\n`;
                        }
                    }
                    break;
                case 'cat':
                    let filePath = args[1];
                    if (!filePath) {
                        response = `<span class="error-message">cat: missing operand</span>\n`;
                    } else {
                        let fullFilePath = filePath.startsWith('/') ? filePath : (currentDirectory === '/' ? `/${filePath}` : `${currentDirectory}/${filePath}`);
                        let fileNode = getPathContent(fullFilePath);

                        if (!fileNode) {
                            response = `<span class="error-message">cat: ${filePath}: No such file or directory</span>\n`;
                        } else if (fileNode.type === 'directory') {
                            response = `<span class="error-message">cat: ${filePath}: Is a directory</span>\n`;
                        } else {
                            if (fileNode.content.includes('https://') || fileNode.content.includes('http://')) {
                                response = fileNode.content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="link-color">$1</a>');
                            } else {
                                response = fileNode.content;
                            }
                        }
                    }
                    break;
                case 'clear':
                    terminalContent = TERMINAL_PERSISTENT_CONTENT;
                    renderPromptAndInput();
                    return;
                case 'echo':
                    response = args.length > 1 ? args.slice(1).join(' ') + '\n' : '\n';
                    break;
                case 'theme':
                    if (args.length > 1) {
                        const themeName = args[1].toLowerCase();
                        if (['dark', 'light', 'blue', 'red'].includes(themeName)) {
                            document.body.className = '';
                            document.body.classList.add(`theme-${themeName}`);
                            localStorage.setItem('terminalTheme', themeName);
                            response = `Theme set to '${themeName}'.\n`;
                        } else {
                            response = "Usage: theme <dark|light|blue|red>. Available themes: dark, light, blue, red.\n";
                        }
                    } else {
                        response = "Usage: theme <dark|light|blue|red>. Available themes: dark, light, blue, red.\n";
                    }
                    break;
                case '':
                    response = '';
                    break;
                default:
                    response = `<span class="error-message">Command not found: ${command}.</span> Type 'help' for assistance.\n`;
                    break;
            }
        }
        await typeOutput(response);
    }


    // --- Password Handling Function ---
    async function handlePasswordInput(input) {
        let currentResponse = '';

        if (input === SUDO_PASSWORD) {
            currentResponse += `<span class="command-highlight">Authentication successful.</span>\n`;
            isWaitingForPassword = false;
            isAuthenticatedSudoSession = true;

            if (sudoCommandPending === 'rm -rf /*') {
                await typeOutput(currentResponse);
                await executeSudoRmRfStar();
                sudoCommandPending = '';
                return;
            }
            else if (sudoCommandPending === 'game') {
                currentResponse += await startGame();
            } else if (sudoCommandPending === '') {
                 currentResponse += `
<span class="warning-message">Usage: sudo [command]</span>
Available sudo commands:
  <span class="command-highlight">sudo game</span>     - Start a small terminal game.
  <span class="command-highlight">sudo rm -rf /*</span> - <span class="error-error">Proceed with extreme caution. This command simulates system termination.</span>
`;
            } else {
                currentResponse += `<span class="error-message">sudo: ${sudoCommandPending}: command not found.</span>\n`;
            }
            sudoCommandPending = '';
            await typeOutput(currentResponse);

        } else {
            currentResponse = `<span class="error-message">Authentication failed.</span>\n`;
            isWaitingForPassword = false;
            isAuthenticatedSudoSession = false;
            sudoCommandPending = '';
            await typeOutput(currentResponse);
        }
    }


    // --- Game Logic ("Guess the Number") ---
    async function startGame() {
        isGameActive = true;
        secretNumber = Math.floor(Math.random() * GAME_MAX_NUMBER) + 1;
        guessesLeft = 5;
        return `
<span class="welcome-message">Starting 'Guess the Number' game...</span>
I'm thinking of a number between 1 and ${GAME_MAX_NUMBER}.
You have ${guessesLeft} guesses. Type your guess and press Enter.
Type 'exit' to quit the game.
`;
    }

    async function handleGameInput(input) {
        let response = '';
        if (input.toLowerCase() === 'exit') {
            response = "<span class='welcome-message'>Exiting game.</span>\n";
            isGameActive = false;
            await typeOutput(response);
            return;
        }

        const guess = parseInt(input);
        if (isNaN(guess)) {
            response = `<span class="error-message">Invalid input. Please enter a number.</span>\n`;
            await typeOutput(response);
            return;
        }

        guessesLeft--;
        if (guess === secretNumber) {
            response = `
<span class="command-highlight">Congratulations! You guessed the number ${secretNumber} correctly!</span>
`;
            isGameActive = false;
        } else if (guess < secretNumber) {
            response = `Too low! You have ${guessesLeft} guesses left.\n`;
        } else {
            response = `Too high! You have ${guessesLeft} guesses left.\n`;
        }

        if (guessesLeft === 0 && isGameActive) {
            response += `
<span class="error-message">Game Over! You ran out of guesses.</span>
The number was ${secretNumber}.
`;
            isGameActive = false;
        }
        await typeOutput(response);
    }


    // --- Sudo rm -rf /* Simulation ---
    async function executeSudoRmRfStar() {
        setTimeout(() => {
            terminalContainer.style.opacity = 0;
            terminalContainer.style.transition = 'opacity 2s ease-out';

            setTimeout(() => {
                terminalContainer.innerHTML = `<div id="sudo-shutdown-message">
                    <h1>SYSTEM OFFLINE</h1>
                    <p>Unauthorized root access detected. Services terminated.</p>
                    <p>Please try again later. Or don't.</p>
                </div>`;
                terminalContainer.style.opacity = 1;
                clearInterval(bannerInterval);
            }, 2000);
        }, 1000);
    }


    // --- Initialize Theme from Local Storage ---
    const savedTheme = localStorage.getItem('terminalTheme');
    if (savedTheme) {
        document.body.className = '';
        document.body.classList.add(`theme-${savedTheme}`);
    }

    // Initial render of prompt and cursor
    renderPromptAndInput();
    ensureHiddenInputFocused(); // Initial call to ensure focus
});