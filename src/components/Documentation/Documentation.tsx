import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './Documentation.css';

const docModules = import.meta.glob('/public/docs/*.md', { query: '?raw', import: 'default' });

interface DocPage {
    id: string;
    title: string;
    load: () => Promise<string>;
}

const docsList: DocPage[] = Object.keys(docModules).map((path) => {
    const filename = path.replace('/public/docs/', '').replace('.md', '');
    return {
        id: filename,
        title: filename.replace(/_/g, ' '),
        load: docModules[path] as () => Promise<string>
    };
});

export default function Documentation() {
    const [activeDoc, setActiveDoc] = useState<DocPage | null>(docsList[0] || null);
    const [content, setContent] = useState("Loading...");

    useEffect(() => {
        if (activeDoc) {
            setContent("Loading document...");
            activeDoc.load()
                .then((text) => setContent(text))
                .catch(() => setContent("# Error\nCould not load content."));
        } else {
            setContent("# No documents found\nAdd `.md` files to the `public/docs/` folder.");
        }
    }, [activeDoc]);

    return (
        <div className="docs-container">
            <aside className="docs-sidebar">
                <h3>Docs</h3>
                <ul>
                    {docsList.map(page => (
                        <li 
                            key={page.id} 
                            className={activeDoc?.id === page.id ? 'active' : ''}
                            onClick={() => setActiveDoc(page)}
                        >
                            {page.title}
                        </li>
                    ))}
                    {docsList.length === 0 && (
                        <li style={{ color: 'var(--text-muted)' }}>No files...</li>
                    )}
                </ul>
            </aside>
            
            <main className="docs-content">
                <div className="markdown-body">
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        style={oneDark}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className="inline-code" {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    >
                        {content}
                    </Markdown>
                </div>
            </main>
        </div>
    );
}