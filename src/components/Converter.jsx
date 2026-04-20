import { useState, useCallback } from 'react'

const FORMAT_CONFIG = {
    pdf: {
        download: true,
        contentType: 'application/pdf',
        fileExtension: 'pdf',
    },
    html: {
        openInNewTab: true,
        contentType: 'text/html',
        fileExtension: 'html',
    },
    json: {
        openInNewTab: true,
        contentType: 'application/json',
        fileExtension: 'json',
    },
}

export default function Converter() {
    const [file, setFile] = useState(null)
    const [format, setFormat] = useState('pdf')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleFileChange = useCallback((e) => {
        const selectedFile = e.target.files?.[0] || null
        setFile(selectedFile)
        setError(null)
    }, [])

    const handleDownload = async (response, originalName, extension) => {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = originalName.replace('.docx', `.${extension}`)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleOpenInNewTab = async (response, contentType) => {
        let content
        if (contentType === 'application/json') {
            const jsonData = await response.json()
            content = JSON.stringify(jsonData, null, 2)
        } else {
            content = await response.text()
        }
        const blob = new Blob([content], { type: contentType })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    const handleSubmit = useCallback(async () => {
        if (!file) {
            setError('Please select a .docx file first.')
            return
        }

        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch(
                `https://docxrenderer.onrender.com/api/convert?format=${format}`,
                { method: 'POST', body: formData }
            )

            if (!response.ok) {
                const errorMessage = await response.text()
                throw new Error(errorMessage || 'Conversion failed')
            }

            const config = FORMAT_CONFIG[format]

            if (config.download) {
                await handleDownload(response, file.name, config.fileExtension)
            } else if (config.openInNewTab) {
                await handleOpenInNewTab(response, config.contentType)
            }

        } catch (err) {
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }, [file, format])

    return (
        <div className="max-w-xl mx-auto pt-20 px-6">

            {/* Header */}
            <h1 className="text-3xl font-bold mb-2">DocxRenderer</h1>
            <p className="text-gray-400 mb-8">
                Upload a .docx file and convert it to PDF, HTML, or JSON.
            </p>

            {/* File Upload */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select File
                </label>
                <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="block w-full text-sm text-gray-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded file:border-0
                     file:bg-gray-800 file:text-white
                     hover:file:bg-gray-700 cursor-pointer"
                />
                {file && (
                    <p className="mt-2 text-sm text-gray-400">
                        Selected: {file.name}
                    </p>
                )}
            </div>

            {/* Format Selector */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Output Format
                </label>
                <div className="flex gap-3">
                    {['pdf', 'html', 'json'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFormat(f)}
                            disabled={loading}
                            className={`px-5 py-2 rounded font-medium text-sm uppercase tracking-wide transition-colors
                ${format === f
                                ? 'bg-blue-300 text-gray-900'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Convert Button */}
            <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="w-full py-3 rounded font-semibold text-sm uppercase tracking-wide
                   bg-blue-300 text-gray-900 hover:bg-blue-200
                   disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
            >
                {loading ? 'Converting...' : `Convert to ${format.toUpperCase()}`}
            </button>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 rounded bg-red-900/40 border border-red-700 text-red-300 text-sm">
                    {error}
                </div>
            )}

        </div>
    )
}

export default Converter