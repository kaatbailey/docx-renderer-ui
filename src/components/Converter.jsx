import { useState } from 'react'

function Converter() {
    const [file, setFile] = useState(null)
    const [format, setFormat] = useState('pdf')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
        setError(null)
    }

    const handleSubmit = async () => {
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
                `http://localhost:8080/api/convert?format=${format}`,
                { method: 'POST', body: formData }
            )

            if (!response.ok) {
                const message = await response.text()
                throw new Error(message)
            }

            if (format === 'pdf') {
                // For PDF — create a download link and click it automatically
                const blob = await response.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = file.name.replace('.docx', '.pdf')
                a.click()
                URL.revokeObjectURL(url)
            } else if (format === 'html') {
                // For HTML — open in a new browser tab
                const html = await response.text()
                const blob = new Blob([html], { type: 'text/html' })
                const url = URL.createObjectURL(blob)
                window.open(url, '_blank')
            } else if (format === 'json') {
                // For JSON — open raw JSON in a new tab for now
                const json = await response.json()
                const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                window.open(url, '_blank')
            }

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

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
                            className={`px-5 py-2 rounded font-medium text-sm uppercase tracking-wide transition-colors
                ${format === f
                                ? 'bg-blue-300 text-white'
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
                disabled={loading}
                className="w-full py-3 rounded font-semibold text-sm uppercase tracking-wide
                   bg-blue-300 hover:bg-blue-500 disabled:bg-gray-700
                   disabled:text-gray-500 transition-colors"
            >
                {loading ? 'Converting...' : 'Convert'}
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