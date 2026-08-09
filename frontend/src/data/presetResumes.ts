export interface PresetResume {
  id: string;
  title: string;
  subtitle: string;
  role: string;
  roleLabel: string;
  yoe: string;
  fileName: string;
  jd: string;
  resumeContent: string;
}

export const PRESET_RESUMES: PresetResume[] = [
  {
    id: "google-senior-frontend",
    title: "Google Senior Frontend Engineer",
    subtitle: "8+ YOE • React 19, TypeScript, Web Vitals, Micro-frontends",
    role: "senior_frontend_engineer",
    roleLabel: "Senior Frontend Engineer",
    yoe: "5+ years",
    fileName: "Google_Senior_Frontend_Engineer_Resume.pdf",
    jd: `Google Senior Frontend Engineer - Target Requirements:
• 5+ years of software development experience with expertise in modern JavaScript/TypeScript and React ecosystem.
• Deep understanding of Web Vitals performance optimization, browser rendering pipeline, DOM efficiency, and micro-frontend architecture.
• Experience building complex, high-traffic web applications with state management (Zustand, Redux, React Query).
• Strong track record of technical leadership, code reviews, automated unit/E2E testing (Jest, Playwright), and Web Content Accessibility Guidelines (WCAG 2.1 AA).
• Experience with build tools (Vite, Webpack, Turbopack) and CI/CD automated deployment pipelines.`,
    resumeContent: `Alex Rivera
Senior Frontend Engineer | Google Candidate Preset
Email: alex.rivera@example.com | GitHub: github.com/alexrivera-dev | Portfolio: alexrivera.dev

SUMMARY
Staff-level Frontend Engineer with 8+ years of experience architecting resilient, web-scale applications using React, TypeScript, Next.js, and WebGL. Proven track record of improving Core Web Vitals (LCP -45%, CLS <0.01) for 10M+ MAU platforms.

WORK EXPERIENCE
Lead Frontend Architect — TechCorp Inc. (2021 – Present)
• Re-architected monolithic SPA into micro-frontends using Module Federation, reducing initial bundle size by 62% and improving build times by 4x across 15 feature teams.
• Standardized UI design system with React, Tailwind CSS, and Radix UI primitives, ensuring WCAG 2.1 AA compliance across 200+ components.
• Optimized real-time data visualizer with Canvas/WebGL, handling 50k concurrent WebSockets events at 60 FPS.

Senior Software Engineer — CloudScale Systems (2018 – 2021)
• Built server-side rendered (SSR) web portal with Next.js and TypeScript, increasing organic search traffic by 180%.
• Implemented automated testing suite with Jest and Playwright achieving 92% code coverage.

EDUCATION & SKILLS
• B.S. in Computer Science — Stanford University
• Core Tech: TypeScript, React 19, Next.js, Node.js, Zustand, GraphQL, Webpack, Vite, Tailwind CSS, Jest, Playwright, Web Vitals, Docker.`,
  },
  {
    id: "meta-backend",
    title: "Meta Backend Engineer",
    subtitle: "4+ YOE • Python, Distributed Systems, GraphQL, Redis, Kafka",
    role: "backend_engineer",
    roleLabel: "Backend Engineer",
    yoe: "3-5 years",
    fileName: "Meta_Backend_Engineer_Resume.pdf",
    jd: `Meta Backend Engineer - Target Requirements:
• 3+ years of backend software development experience in Python, C++, or Go.
• Proven expertise in distributed system design, high-throughput microservices, API architecture (GraphQL, gRPC, REST), and async concurrency.
• Strong working knowledge of database engines (PostgreSQL, MySQL, RocksDB) and distributed caching/messaging (Redis, Memcached, Apache Kafka).
• Experience with observability, distributed tracing (OpenTelemetry, Jaeger), performance tuning, and database indexing strategies.
• Bachelor's or Master's degree in Computer Science or equivalent practical experience.`,
    resumeContent: `Morgan Vance
Backend Software Engineer | Meta Candidate Preset
Email: morgan.vance@example.com | GitHub: github.com/mvance-backend

SUMMARY
Backend Software Engineer with 4.5 years of experience building scalable microservices and distributed data pipelines in Python, FastAPI, Django, and PostgreSQL. Specialized in low-latency API design and asynchronous event stream processing.

WORK EXPERIENCE
Senior Backend Engineer — DataPulse Labs (2022 – Present)
• Designed and deployed distributed event processing engine handling 120,000 requests/sec using Python AsyncIO, Apache Kafka, and Redis cluster.
• Built GraphQL and gRPC microservices backend supporting mobile and web clients with sub-20ms p99 latency.
• Engineered database partitioning and indexing strategy on PostgreSQL, cutting query latency by 55% under high write contention.

Software Engineer — StreamFlow Tech (2020 – 2022)
• Implemented rate-limiting and authentication middleware with Python/FastAPI and Redis for public API gateway.
• Containerized 12 microservices with Docker and Kubernetes (EKS), establishing automated CI/CD pipelines with GitHub Actions.

EDUCATION & SKILLS
• M.S. in Computer Science — University of California, Berkeley
• Core Tech: Python, FastAPI, Django, Go, C++, PostgreSQL, Redis, Kafka, GraphQL, gRPC, Docker, Kubernetes, OpenTelemetry, AWS.`,
  },
  {
    id: "ai-research-intern",
    title: "AI Research Intern",
    subtitle: "Entry Level • PyTorch, LLM Fine-Tuning, Transformer Models, RAG",
    role: "software_engineering_intern",
    roleLabel: "AI Research Intern",
    yoe: "0-1 years",
    fileName: "AI_Research_Intern_Resume.pdf",
    jd: `AI Research Intern - Target Requirements:
• Currently pursuing B.S., M.S., or Ph.D. in Computer Science, Artificial Intelligence, or Data Science.
• Proficiency in Python and deep learning frameworks (PyTorch, TensorFlow, HuggingFace Transformers).
• Hands-on experience with Large Language Models (LLMs), RAG architectures, prompt optimization, vector databases (FAISS, Chroma, Pinecone), and evaluation metrics.
• Solid background in linear algebra, probability, optimization algorithms, and machine learning research methodologies.
• Published research papers or open-source AI projects are a strong plus.`,
    resumeContent: `Jordan Chen
AI Research Candidate | AI Intern Preset
Email: jordan.chen@example.edu | GitHub: github.com/jordan-ai-lab | arXiv: arxiv.org/a/chen_j

SUMMARY
Computer Science & AI Master's candidate with hands-on research experience in PyTorch, Transformer fine-tuning (LoRA, QLoRA), and retrieval-augmented generation (RAG) systems. Co-authored 1 publication in NLP workshop.

PROJECTS & RESEARCH EXPERIENCE
Graduate AI Research Assistant — NLP & Vision Lab (2023 – Present)
• Fine-tuned Llama-3 and Mistral models on domain-specific corpora using PyTorch, DeepSpeed, and HuggingFace Accelerate, improving benchmark accuracy by 14.2%.
• Built hybrid RAG baseline integrating dense vector retrieval (FAISS) with BM25 sparse keyword ranking, boosting context relevance score to 88.5%.
• Published preprint: "Optimizing Contextual Dense Retrieval in Domain-Specific QA Pipelines" (arXiv 2024).

Open Source Machine Learning Contributions (2022 – Present)
• Contributed performance optimizations to HuggingFace Transformers library for quantized inference.
• Developed Python benchmark toolkit for evaluating ATS & document parsing accuracy across LLM providers.

EDUCATION & SKILLS
• M.S. in Artificial Intelligence (GPA 3.9/4.0) — Carnegie Mellon University (Exp. 2025)
• B.S. in Computer Science — UT Austin (2023)
• Core Tech: Python, PyTorch, HuggingFace, CUDA, NumPy, Pandas, Scikit-Learn, FAISS, Pinecone, LangChain, RAG, Git, Linux.`,
  },
];

export const createPresetFile = (preset: PresetResume): File => {
  const safeContent = preset.resumeContent.replace(/[()\\]/g, '\\$&');
  const pdfText = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${safeContent.length + 100} >>
stream
BT
/F1 12 Tf
72 712 Td
(${safeContent}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
350
%%EOF`;

  const blob = new Blob([pdfText], { type: 'application/pdf' });
  return new File([blob], preset.fileName, { type: 'application/pdf' });
};
