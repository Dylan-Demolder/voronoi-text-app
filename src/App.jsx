import React, { useRef, useEffect, useState } from 'react'
import { Delaunay } from 'd3-delaunay'

const ASPECT = 900 / 300 // width / height ratio used for sampling and drawing logic

function samplePointsFromText(text, density = 1.2) {
  // create an offscreen canvas and draw the text so we can sample pixels
  // Use internal sampling size (fixed) so sampling resolution is stable
  const SAMPLE_W = 900
  const SAMPLE_H = 300
  const off = document.createElement('canvas')
  off.width = SAMPLE_W
  off.height = SAMPLE_H
  const ctx = off.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, off.width, off.height)
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'middle'

  // size text to fit
  let fontSize = 220
  ctx.font = `${fontSize}px serif`
  while (ctx.measureText(text).width > off.width - 40 && fontSize > 10) {
    fontSize -= 4
    ctx.font = `${fontSize}px serif`
  }
  ctx.fillText(text, 20, off.height / 2)

  const img = ctx.getImageData(0, 0, off.width, off.height).data
  const points = []
  const step = Math.max(1, Math.floor(4 / Math.max(0.001, density)))
  for (let y = 0; y < off.height; y += step) {
    for (let x = 0; x < off.width; x += step) {
      const idx = (y * off.width + x) * 4
      const r = img[idx]
      const alpha = img[idx + 3]
      // white text pixels will have high r/g/b and non-zero alpha
      if (r > 180 && alpha > 10 && Math.random() < density) {
        // jitter a little for more organic cells
        points.push([x + (Math.random() - 0.5) * 2, y + (Math.random() - 0.5) * 2])
      }
    }
  }

  // add some random points so voronoi covers the whole canvas
  for (let i = 0; i < 30; i++) {
    points.push([Math.random() * off.width, Math.random() * off.height])
  }

  return points
}

export default function App() {
  const [text, setText] = useState('I made a thing :)')
  const [density, setDensity] = useState(1.2)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // compute target width (read from container which is 75vw in CSS)
    const cssWidth = container.clientWidth
    const dpr = window.devicePixelRatio || 1
    const width = Math.max(200, Math.round(cssWidth))
    const height = Math.round(width / ASPECT)

    // set canvas internal pixel size for crisp rendering
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, width, height)

    if (!text) return

    // sample at fixed resolution then scale points to the canvas size
    const sampleCanvasW = 900
    const sampleCanvasH = 300
    const rawPoints = samplePointsFromText(text, density)
    if (rawPoints.length === 0) return

    const sx = width / sampleCanvasW
    const sy = height / sampleCanvasH
    const points = rawPoints.map(([x, y]) => [x * sx, y * sy])

    const delaunay = Delaunay.from(points)
    const voronoi = delaunay.voronoi([0, 0, width, height])

    // draw cells
    for (let i = 0; i < points.length; i++) {
      const cell = voronoi.cellPolygon(i)
      if (!cell) continue
      const [px, py] = points[i]
      const dx = px - width / 2
      const dy = py - height / 2
      const d = Math.sqrt(dx * dx + dy * dy)
      const t = Math.min(1, d / (Math.sqrt(width * width + height * height) / 2))
      const hue = Math.floor(200 + t * 160) % 360
      ctx.beginPath()
      ctx.moveTo(cell[0][0], cell[0][1])
      for (let j = 1; j < cell.length; j++) ctx.lineTo(cell[j][0], cell[j][1])
      ctx.closePath()
      ctx.fillStyle = `hsl(${hue}deg 70% ${20 + t * 50}%)`
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'
      ctx.stroke()
    }

    // draw points
    ctx.fillStyle = 'rgba(0,0,0,0.8)'
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p[0], p[1], 0.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [text, density])

  return (
    <div className="app">
      <div className="controls">
        <label>
          Text:
          <input
            type="text"
            className="text-input"
            value={text}
            placeholder="Type text to render"
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <label>
          Density:
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={density}
            onChange={(e) => setDensity(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <div className="canvas-wrap" ref={containerRef}>
        <canvas ref={canvasRef} />
        <div className="text-preview">{text}</div>
      </div>
      <p className="note">Tip: try short words or initials for best results</p>
    </div>
  )
}
