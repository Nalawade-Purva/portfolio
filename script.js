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
    let isAuthenticatedSudoSession = false; // NEW: Tracks if sudo session is act


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
<span class="content-title">Purva Nalawade</span>
<span class="content-tech">B.Tech Cybersecurity with Honours in AI/ML | CEH v13 | Security+ | ISC2 CC</span>

<span class="content-header">Cybersecurity Intern:</span> Maharashtra Cyber (Jan 2026 – Aug 2026)  
<span class="content-header">Research Intern:</span> CyberPeace Foundation, Centre of Excellence (Jan 2026 – May 2026)  
<span class="content-header">Former Red Team Analyst – Intern:</span> DeepCytes (UK)

I work at the intersection of offensive security and AI security research.  
My experience includes web application VAPT aligned with OWASP standards, OSINT-driven investigation and SIEM triage at Maharashtra Cyber, and building adversarial-ML pipelines at CyberPeace Foundation.

My research on adversarial transferability, LLM inference-time forgetting, and facial identity protection has been accepted at Springer venues, and I have an Indian patent application filed on zero-knowledge adversarial forensic simulation. Type <span class="command-highlight">research</span> to read more.

Previously, I worked as a <span class="content-header">Full Stack Development Intern</span> at Millennium Enterprise, where I built a secure web application with JWT/OAuth authentication and strict input validation.

<span class="content-header">Achievements:</span>  
<span class="content-bullet">*</span> Top 10 Finalist — National iDEA Hackathon 2025  
<span class="content-bullet">*</span> Consolation Prize Winner (Top 12 / 750+ teams) — MHA, BPR&D & NCRB Hackathon 2.0, New Delhi  
<span class="content-bullet">*</span> TryHackMe Top 2% Globally  
<span class="content-bullet">*</span> Accepted at WorldS4 2026 and ICTCS 2026 (Springer LNNS)  
<span class="content-bullet">*</span> Indian Patent Application No. 202621074738  
<span class="content-bullet">*</span> Contributor to the book <span class="content-tech">Intelligent Forensic</span>

<span class="content-header">Currently Focused On:</span>  
<span class="content-tech">Red Teaming • Adversarial ML • AI Security • Threat Analysis</span>
`
                },
                'education.txt': {
                    type: 'file',
                    content: `
<span class="content-title">EDUCATION</span>
  - Shah and Anchor Kutchhi Engineering College, University of Mumbai (2023 - Expected May 2027)
      B.Tech in Cyber Security (CGPA: 8.83/10)
      Honors in AI/ML (CGPA: 9.5/10)
      <span class="content-header">Coursework:</span> <span class="content-tech">AI/ML with Cyber Security • Cryptography & Network Security • Cyber Crime Investigation & Digital Forensics • Security Operations Center • Penetration Testing • Cloud & Multi-Cloud Security</span>
  - Peoples Education Society (2021 - 2023)
  - Holy Cross Convent High School (2015 - 2021)
`
                },
                'skills.txt': {
                    type: 'file',
                    content: `
<span class="content-title">SKILLS</span>

<span class="content-header">Programming:</span> 
<span class="content-tech">Python • C • Bash • SQL • JavaScript • TypeScript</span>

<span class="content-header">Security & Systems:</span> 
<span class="content-tech">Burp Suite • Nmap • Wireshark • Metasploit • Suricata • QRadar (SIEM) • Autopsy • FlareVM</span>

<span class="content-header">AI / ML Security:</span> 
<span class="content-tech">PyTorch • HuggingFace Transformers • ART (Adversarial Robustness Toolbox) • scikit-learn • Presidio • spaCy</span>

<span class="content-header">Web Security & Red Team:</span> 
<span class="content-tech">Web Application VAPT (OWASP Top 10) • Vulnerability Validation • Basic Exploitation & Enumeration • Structured Security Reporting</span>

<span class="content-header">OSINT & Investigation:</span> 
<span class="content-tech">Maltego • ExifTool • DarkOwl • WHOIS • theHarvester • Digital Forensics • Threat Intelligence</span>

<span class="content-header">Cloud & Infrastructure:</span> 
<span class="content-tech">AWS (Cloud Architecture, Security & Operations) • Linux (Kali/Ubuntu) • Docker • VirtualBox/VMware • Git & GitHub • GitHub Actions (CI/CD)</span>

<span class="content-header">Web Development:</span> 
<span class="content-tech">Node.js • Express • MongoDB • React • Next.js • Secure Authentication & Input Validation</span>

<span class="content-header">Soft Skills:</span> 
<span class="content-tech">Leadership • Communication • Analytical Thinking • Adaptability • Team Collaboration • Time Management</span>
`
                },
                'contact.txt': {
                    type: 'file',
                    content: `
<span class="content-title">CONTACT</span>
  <span class="content-header">Location:</span> Thane, Maharashtra, India
  <span class="content-header">Email:</span> purvanalawade09@gmail.com
  <span class="content-header">GitHub:</span> https://github.com/Nalawade-Purva
  <span class="content-header">LinkedIn:</span> https://www.linkedin.com/in/purva-nalawade-532921315/
`
                },
                'research.txt': {
                    type: 'file',
                    content: `
<span class="content-title">RESEARCH & PUBLICATIONS</span>
--------------------------------------------------------------------------------
<span class="command-highlight">Beyond Single-Dataset Evaluation: Cross-Dataset Adversarial Transferability in NIDS</span>
  - <span class="content-header">Venue:</span> WorldS4 2026 (Springer LNNS, Scopus-indexed)
  - <span class="content-header">Status:</span> Accepted, oral presentation on Jul 28, 2026
  - <span class="content-header">Summary:</span> Cross-dataset transferability of adversarial attacks (BoundaryAttack via ART) against Random Forest and XGBoost on CICIDS2017 and UNSW-NB15.

--------------------------------------------------------------------------------
<span class="command-highlight">TrustFade: LLM Inference-Time Forgetting</span>
  - <span class="content-header">Venue:</span> ICTCS 2026 (Springer LNNS)
  - <span class="content-header">Status:</span> Accepted, oral presentation on Dec 17, 2026
  - <span class="content-header">Summary:</span> A 648-trial study of behavioral suppression across Llama model scales and probe types.

--------------------------------------------------------------------------------
<span class="command-highlight">Deceiving AI While Preserving Human Perception: A Generative Adversarial Approach to Facial Identity Protection</span>
  - <span class="content-header">Status:</span> Accepted at AIS 2026 (Springer LNCS) but withdrawn prior to publication; currently under review at ICISS 2026.

--------------------------------------------------------------------------------
<span class="command-highlight">Indian Patent Application No. 202621074738</span>
  - <span class="content-header">Title:</span> Cybersecurity Defense System and Method for Zero-Knowledge Adversarial Forensic Simulation and Vulnerability Assessment
  - <span class="content-header">Status:</span> Filed Jun 16, 2026. Published, under examination.

--------------------------------------------------------------------------------
<span class="command-highlight">Intelligent Forensic (Published Book)</span>
  - <span class="content-header">Role:</span> Editorial team member & contributor (Millennium Enterprises)
`
                },
                'certifications.txt': {
                    type: 'file',
                    content: `
<span class="content-title">CERTIFICATIONS</span>
--------------------------------------------------------------------------------
<span class="command-highlight">AWS Academy Graduate</span>
  - <span class="content-header">Issued by:</span> AWS Academy (Amazon Web Services Training and Certification)
  - <span class="content-header">Date:</span> June 2026
  - <span class="content-header">Badges:</span>
    <span class="content-bullet">*</span> Cloud Architecting (Jun 21, 2026)
    <span class="content-bullet">*</span> Cloud Developing (Jun 21, 2026)
    <span class="content-bullet">*</span> Cloud Operations (Jun 22, 2026)
    <span class="content-bullet">*</span> Cloud Security Foundations (Jun 22, 2026)
    <span class="content-bullet">*</span> Engineering Operations Technicians (Jun 23, 2026)
  - <span class="content-header">Skills Covered:</span> <span class="content-tech">AWS Architecture, Cloud Security, Cloud Operations, Cloud Development</span>

--------------------------------------------------------------------------------
<span class="command-highlight">CompTIA Security+ (SY0-701)</span>
  - <span class="content-header">Issued by:</span> CompTIA
  - <span class="content-header">Description:</span> Validated baseline skills in threat analysis, security architecture, incident response, and risk management.
  - <span class="content-header">Skills Covered:</span> <span class="content-tech">Threat Management, Security Operations, Network Security, Governance & Risk</span>

--------------------------------------------------------------------------------
<span class="command-highlight">Certified in Cybersecurity (CC) — ISC²</span>
  - <span class="content-header">Issued by:</span> ISC²
  - <span class="content-header">Date:</span> June 2025
  - <span class="content-header">Description:</span> Earned the globally recognized Certified in Cybersecurity (CC) credential, validating fundamental knowledge in information security principles, network security, incident response, and security operations.
  - <span class="content-header">Skills Covered:</span> <span class="content-tech">Cybersecurity Concepts, Access Control, Network Security, Security Operations, Risk Management</span>

--------------------------------------------------------------------------------
<span class="command-highlight">Certified Ethical Hacker (CEH v13) — EC-Council</span>
  - <span class="content-header">Issued by:</span> EC-Council
  - <span class="content-header">Date:</span> July 2025
  - <span class="content-header">Description:</span> Demonstrated advanced understanding of ethical hacking methodologies, penetration testing, and exploit analysis. Achieved a score of 118 in the CEH examination.
  - <span class="content-header">Skills Covered:</span> <span class="content-tech">Penetration Testing, Vulnerability Assessment, Exploit Development, Malware Analysis, Network Defense</span>

--------------------------------------------------------------------------------
<span class="command-highlight">TryHackMe Certifications — Top 2% Globally</span>
  - <span class="content-header">Issued by:</span> TryHackMe (handle: 404xShadow)
  - <span class="content-header">Certificates:</span> Web Fundamentals & Junior Penetration Tester
  - <span class="content-header">Description:</span> Hands-on training in ethical hacking, web exploitation, and security assessment through interactive labs and real-world attack simulations. Ranked in the top 2% globally.
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
<span class="command-highlight">Leadership & Club Involvement</span>

<span class="command-highlight">Events Lead - Cyber Council, SAKEC</span>
  <span class="content-bullet">*</span> Led and organized multiple cybersecurity awareness sessions and competitions.
  <span class="content-bullet">*</span> Coordinated with industry experts to host guest lectures and technical workshops.
  <span class="content-bullet">*</span> Managed event logistics, marketing, and student engagement initiatives.

<span class="command-highlight">Events Head - Ek Bharat Shreshtha Bharat (EBSB) Club SAKEC</span>
  <span class="content-bullet">*</span> Headed the Events Team for cultural and technical exchange programs.
  <span class="content-bullet">*</span> Organized inter-college competitions promoting collaboration and national integration.

<span class="command-highlight">Operations Team Member - GDG on Campus</span>
  <span class="content-bullet">*</span> Contributed to planning and execution of technical workshops and community initiatives.
  <span class="content-bullet">*</span> Assisted in speaker coordination, event logistics, and student engagement.

<span class="command-highlight">Technical Team Member - Cyber Council</span>
  <span class="content-bullet">*</span> Supported cybersecurity workshops, awareness sessions, and technical competitions.
  <span class="content-bullet">*</span> Assisted in preparing technical content and coordinating event execution.


<span class="command-highlight">Editorial Team - Intelligent Forensic (Published Book)</span>
  <span class="content-bullet">*</span> Contributed to research, content development, and technical writing for a published book on digital forensics.
  <span class="content-bullet">*</span> Participated in the editorial and review process, including proofreading, fact-checking, and content structuring.

<span class="command-highlight">Hackathon Participation</span>
  <span class="content-bullet">*</span> National iDEA Hackathon 2025 (Top 10 Finalist) - Phishing Link Detection & Takedown Platform
  <span class="content-bullet">*</span> MHA, BPR&D & NCRB Hackathon 2.0, New Delhi (Consolation Prize Winner, Top 12 / 750+ Teams) - CCTV Cyber Defense Project


<span class="command-highlight">CTF Participation</span>
  <span class="content-bullet">*</span> Competed in DawgCTF 2025 (UMBC, USA - 64th), KJSSE CTF 3.0, Bypass CTF 2025 (AIT Pune), CREST CTF 2026, and Hacker's Gambit (OWASP).
  <span class="content-bullet">*</span> Solved challenges across Web Exploitation, OSINT, Digital Forensics, Steganography, Reverse Engineering, and Misc categories involving vulnerability analysis, traffic inspection, and logic-based exploitation.
`
                },
                'internships': {
                    type: 'directory',
                    contents: {
                        'maharashtra_cyber.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Cybersecurity Intern — Maharashtra Cyber (January 2026 – August 2026)</span>
  - <span class="content-header">Description:</span> Hands-on work in state-level cyber operations: IP tracing and OSINT investigation for child-safety referrals, extortion and deepfake cases, plus SIEM alert triage.
  - <span class="content-header">Key Highlights:</span>
    <span class="content-bullet">*</span> Traced IP origins and mapped digital footprints for 50 NCMEC-referred cases daily over 4 months, identifying the originating district/city and forwarding findings to the relevant local law enforcement unit.
    <span class="content-bullet">*</span> Tracked extortion and deepfake dissemination across Instagram, WhatsApp, and Snapchat using Maltego, ExifTool, DarkOwl, WHOIS, and theHarvester, supporting takedown requests on 15 cases.
    <span class="content-bullet">*</span> Triaged 20-30 IBM QRadar (SIEM) alerts daily, escalating suspicious activity to senior analysts for investigation.
  - <span class="content-header">Skills Gained:</span> <span class="content-tech">OSINT Investigation, IP Tracing, SIEM Triage (QRadar), Takedown Support</span>
  - <span class="content-header">Location:</span> Mumbai
  - <span class="content-header">Status:</span> Completed
`
                        },
                        'coe_project_intern.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Research Intern — CyberPeace Foundation (Centre of Excellence) (January 2026 – May 2026)</span>
  - <span class="content-header">Description:</span> Contributed to cybersecurity and AI-safety research, building core pipelines for AI-AwareX — an explainable, deterministic cybersecurity risk detection platform.
  - <span class="content-header">Key Highlights:</span>
    <span class="content-bullet">*</span> Conceived and built modular pipelines for AI-AwareX, integrating a Differentiable JPEG Simulator via Projected Gradient Descent (PGD) so adversarial cloaking survives platform re-encoding.
    <span class="content-bullet">*</span> Implemented deterministic heuristic and regex pipelines for PII redaction (Aadhaar, PAN, financial identifiers) and AI-generated text classification.
  - <span class="content-header">Skills Gained:</span> <span class="content-tech">Adversarial ML, PGD, PII Redaction, Deterministic Detection Systems</span>
  - <span class="content-header">Location:</span> Remote
  - <span class="content-header">Status:</span> Completed
`
                        },
                        'deepcytes_redteam.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Red Team Analyst – Intern — DeepCytes Cyber Labs (July 2025 – December 2025)</span>
  - <span class="content-header">Description:</span> Web application security testing, vulnerability validation, and structured security reporting aligned with OWASP standards.
  - <span class="content-header">Key Highlights:</span>
    <span class="content-bullet">*</span> Executed web application penetration testing (VAPT) across live target environments using Burp Suite, Nmap, and custom automation scripts.
    <span class="content-bullet">*</span> Identified and exploited critical vulnerabilities aligned with OWASP Top 10 (including SQL Injection, IDOR, and broken authentication).
    <span class="content-bullet">*</span> Delivered remediation PoCs and executive risk ratings.
  - <span class="content-header">Skills Gained:</span> <span class="content-tech">Web Application VAPT, Vulnerability Assessment, Exploitation Basics, Security Reporting, Reconnaissance</span>
  - <span class="content-header">Location:</span> Remote / Hybrid
  - <span class="content-header">Status:</span> Completed
`
                        },
                        'millennium_fullstack.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Full Stack Development Intern — Millennium Enterprise (March 2025 – May 2025)</span>
  - <span class="content-header">Description:</span> Built a secure end-to-end web application with a security-first development approach.
  - <span class="content-header">Key Highlights:</span>
    <span class="content-bullet">*</span> Co-developed the Millennium Enterprises book publishing website using Node.js, Express, and MongoDB.
    <span class="content-bullet">*</span> Implemented JWT/OAuth authentication schemes and strict input validation layers to mitigate XSS and injection risks.
  - <span class="content-header">Skills Gained:</span> <span class="content-tech">Full Stack Development, Secure Coding Practices, REST APIs, Authentication Design, Git & GitHub</span>
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
<span class="content-title">Phishing Link Detection & Takedown Platform</span>
  - <span class="content-header">Award:</span> Top 10 Finalist - National iDEA Hackathon 2025
  - <span class="content-header">Description:</span> Automated detection and escalation pipeline for phishing domains targeting public sector banks. Validates SSL anomalies and coordinates real-time takedowns with national incident response frameworks, including CERT-In integration, to reduce cross-jurisdictional response time.
  - <span class="content-header">Tools & Technologies:</span> <span class="content-tech">Next.js, Django, Supabase, CERT-In Integration</span>
`
                        },
                        'guardrailx.txt': {
                            type: 'file',
                            content: `
<span class="content-title">GuardrailX - LLM Governance & Safety Framework</span>
  - <span class="content-header">Description:</span> Built a programmable safety framework that sits between users and Large Language Models (LLMs) to enforce policy, detect jailbreak attempts, prevent sensitive data leakage, and log auditable safety decisions.
  - <span class="content-header">Core Features:</span> Prompt/response risk inspection, jailbreak detection, sanitization controls, automated adversarial testing suite, refusal-delta scoring, bypass rate measurement, latency tracking, safety scorecard generation.
  - <span class="content-header">Evaluation:</span> Evaluates structural safety degradation across Llama 3.3 70B, Mistral, and Qwen, with real-time input/output policy enforcement shields.
  - <span class="content-header">Architecture:</span> Modular guardrail engine + adversarial testing layer + audit API. Compares raw vs protected model behavior to generate measurable safety metrics.
  - <span class="content-header">Tools & Technologies:</span> <span class="content-tech">Python, PyTorch, HuggingFace, LLM Red Teaming</span>
  - <span class="content-header">GitHub:</span> <span class="content-tech">https://github.com/Say-Ee/guardrailx</span>
`
                        },
                        'ai-awarex.txt': {
                            type: 'file',
                            content: `
<span class="content-title">AI-AwareX - Explainable & Deterministic Cybersecurity Risk Detection Platform</span>
  - <span class="content-header">Description:</span> Privacy-preserving platform built to counter AI-driven threats including deepfakes, phishing automation, and data leakage. Combines deterministic detection (PII exposure, AI-generated text patterns, image manipulation) with adversarial defense for biometric identity protection.
  - <span class="content-header">Core Features:</span> Compression-Resistant Adversarial Cloak (Differentiable JPEG Simulator + Projected Gradient Descent, so perturbations survive social media re-encoding), Zero-Knowledge Adversarial Threat Twin (Z-KATT) simulation on synthetic data, PII detection and redaction (Presidio + spaCy; Aadhaar, PAN, financial identifiers), AI-likelihood scoring, unified LOW/MEDIUM/HIGH risk scoring.
  - <span class="content-header">Architecture:</span> React frontend, Django backend with PostgreSQL, central router invoking stateless detectors, unified JSON risk report, deterministic output (same input = same result).
  - <span class="content-header">Security Model:</span> No raw PII storage, no text logging, no face recognition, no external API calls, fully reproducible audit trail.
  - <span class="content-header">Patent:</span> Basis of Indian Patent Application No. 202621074738.
  - <span class="content-header">GitHub:</span> <span class="content-tech">https://github.com/vaidehipathak/AI-Awareness</span>
`
                        },
                        'revenant.txt': {
                            type: 'file',
                            content: `
<span class="content-title">Revenant - Automated Zombie API Discovery & Defence Platform</span>
  - <span class="content-header">Date:</span> Mar 2026 – Present
  - <span class="content-header">Description:</span> Banks accumulate thousands of forgotten API endpoints over years of digital transformation. Revenant scans across 6 discovery vectors — network, API gateways, code repositories, CI/CD pipelines, and traffic logs — to build a complete API inventory, classifying every endpoint as Active, Deprecated, Orphaned, or Zombie.
  - <span class="content-header">Core Features:</span> Automated decommissioning workflow with owner identification, gateway blocking, and repository cleanup. Built-in Risk Correlator maps APIs against the OWASP API Top 10, runs CVE lookups, detects PII exposure, and assesses regulatory impact against RBI, PCI-DSS, and DPDP Act 2023.
  - <span class="content-header">Impact:</span> Reduces mean time to decommission from months to under 14 days. Eliminates blind spots in the API estate and prevents zombie API proliferation from becoming a breach.
  - <span class="content-header">Focus:</span> <span class="content-tech">API Security, OWASP API Top 10, CVE Detection, PII Exposure Analysis, CI/CD Integration, RBI / PCI-DSS / DPDP Act 2023</span>
  - <span class="content-header">GitHub:</span> <span class="content-tech">https://github.com/Say-Ee/revenant</span>
`
                        },
                        'harden-the-grid.txt': {
                            type: 'file',
                            content: `
<span class="content-title">CCTV Cyber Defense - Zero-Trust Surveillance Hardening (Harden the Grid)</span>
  - <span class="content-header">Award:</span> Consolation Prize Winner (Top 12 / 750+ Teams Nationwide) - MHA, BPR&D & NCRB Hackathon 2.0, New Delhi
  - <span class="content-header">Description:</span> Implemented a zero-trust architecture for video surveillance streaming via MediaMTX and encrypted RTSP feeds. Deployed active IDS/IPS anomaly detection to mitigate camera node hijacking and MITM vectors, and validated detection and response by simulating RTSP hijacking, credential brute-forcing, and MITM attacks in controlled environments.
  - <span class="content-header">Tools & Technologies:</span> <span class="content-tech">Python, RTSP, MediaMTX, Suricata (IDS/IPS), VPN/TLS</span>
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
  - <span class="content-header">Description:</span> Developed a multi-utility cybersecurity toolkit that integrates several common offensive and defensive features into a single interface — functioning as a "Swiss Army Knife" for security testing, reconnaissance, and quick incident response.
  - <span class="content-header">Tools & Technologies:</span> <span class="content-tech">Python, Flask/Tkinter, Requests, Socket, OSINT APIs, Nmap, Hashlib, Cryptography Libraries</span>
`
                        }
                    }
                },
                'resume.txt': {
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
        return `<span class="prompt-user">guest</span><span class="prompt-at">@</span><span class="prompt-host">github.io</span>:<span class="prompt-dir">${currentDirectory}</span><span class="prompt-dollar">$</span>`;
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
            <span class="banner-left">purva@nalawade-purva.github.io</span>
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
  <span class="command-highlight">research</span>        - Papers and patent (equivalent to 'cat /research.txt')
  <span class="command-highlight">certifications</span>  - See my earned certifications (equivalent to 'cat /certifications.txt')
  <span class="command-highlight">education</span>       - View my academic background (equivalent to 'cat /education.txt')
  <span class="command-highlight">extracurricular</span> - Explore my activities outside academics (equivalent to 'cat /extracurricular.txt')
  <span class="command-highlight">contact</span>         - Get in touch (equivalent to 'cat /contact.txt')
  <span class="command-highlight">resume</span>          - Get my resume (equivalent to 'resume')

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
                case 'research':
                    return await processCommand('cat /research.txt');
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
                        // This line has been changed to directly reference the PDF file
                        // from the root of your GitHub Pages deployment.
                        downloadFile('PurvaNalawade_Resume.pdf', 'PurvaNalawade_Resume.pdf');
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