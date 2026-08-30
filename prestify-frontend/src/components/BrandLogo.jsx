import prestifyLogo from '../assets/prestify-logo.jpeg'

import './BrandLogo.css'

function BrandLogo({
  variant = 'default',
}) {
  return (
    <div
      className={`brand-logo brand-logo-${variant}`}
    >
      <img
        src={prestifyLogo}
        alt="Prestify"
      />
    </div>
  )
}

export default BrandLogo