import React, { useRef, useEffect, useState } from 'react'
import { Delaunay } from 'd3-delaunay'

const CANVAS_W = 900
const CANVAS_H = 300

function samplePointsFromText(text, density = 1.0) {
  const off = document.createElement('canvas')
  off.width = CANVAS_W
  off.height = CANVAS_H
  const ctx = off.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, off.width, off.height)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 200px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, off.width / 2, off.height / 2 + 30)

  const img = ctx.getImageData(0, 0, off.width, off.height).data
  const points = []
  for (let y = 0; y < off.height; y += Math.max(1, Math.floor(4 / density))) {
    for (let x = 0; x < off.width; x += Math.max(1, Math.floor(4 / density))) {
      const idx = (y * off.width + x) * 4
      const alpha = img[idx + 3]
      const r = img[idx]
      // white text pixels will have high r/g/b
      if (r > 200 && alpha > 10) {
        // jitter a little
        points.push([x + (Math.random() - 0.5) * 2, y + (Math.random() - 0.5) * 2])
      }
    }
  }
  // add some border points so voronoi covers full canvas
  for (let i = 0; i < 30; i++) {
    points.push([Math.random() * off.width, Math.random() * off.height])
  }
  return points
}

export default function App() {
  const [text, setText] = useState('Hello')
  const [density, setDensity] = useState(1.2)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    if (!text) return

    const points = samplePointsFromText(text, density)
    if (points.length === 0) return

    const delaunay = Delaunay.from(points)
    const voronoi = delaunay.voronoi([0, 0, CANVAS_W, CANVAS_H])

    // draw cells
    for (let i = 0; i < points.length; i++) {
      const cell = voronoi.cellPolygon(i)
      if (!cell) continue
      const [px, py] = points[i]
      // color by distance from center
      const dx = px - CANVAS_W / 2
      const dy = py - CANVAS_H / 2
      const d = Math.sqrt(dx * dx + dy * dy)
      const t = Math.min(1, d / (Math.sqrt(CANVAS_W * CANVAS_W + CANVAS_H * CANVAS_H) / 2))
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

    // optional: draw points
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
          <input type="range" min="0.2" max="3" step="0.1" value={density} onChange={(e) => setDensity(parseFloat(e.target.value))} />
        </label>
      </div>
      <div className="canvas-wrap">
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} />
        <div className="text-preview">{text}</div>
      </div>
      <p className="note">Tip: try short words or initials for best results.s</p>
    </div>
  )
}
