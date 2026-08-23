import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Modal, Slider, Button } from 'antd'

function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve) => {
    const image = new Image()
    image.src = imageSrc
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      const ctx = canvas.getContext('2d')

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )

      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg')
    }
  })
}

function AvatarCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropCompleteHandler = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleDone = async () => {
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
    onCropComplete(croppedBlob)
  }

  return (
    <Modal
      open={!!imageSrc}
      onCancel={onCancel}
      footer={null}
      title="Sesuaikan Foto Profil"
      width={400}
    >
      {/* Area crop */}
      <div style={{ position: 'relative', height: 300, background: '#000', borderRadius: 8, overflow: 'hidden' }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteHandler}
        />
      </div>

      {/* Zoom slider */}
      <div style={{ padding: '16px 8px 8px' }}>
        <p style={{ fontSize: 12, marginBottom: 8, color: '#888' }}>Zoom</p>
        <Slider
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={setZoom}
        />
      </div>

      {/* Tombol */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Button onClick={onCancel}>Batal</Button>
        <Button type="primary" onClick={handleDone}>Gunakan Foto</Button>
      </div>
    </Modal>
  )
}

export default AvatarCropper