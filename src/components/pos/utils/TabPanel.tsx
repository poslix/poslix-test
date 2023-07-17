import React from 'react'

export const TabPanel = (props: any) => {

  const { onTabChange } = props

  return (
    <ul
      className="nav nav-tabs-pos nav-justified nav-border-top  mb-3"
      role="tablist"
    >
      <li className="nav-item" onClick={() => { onTabChange('category') }}>
        <a className="nav-link-pos active" data-bs-toggle="tab" role="tab" aria-selected="false">
          Category
        </a>
      </li>

      <li className="nav-item" onClick={() => { onTabChange('brand') }}>
        <a className="nav-link-pos" data-bs-toggle="tab" role="tab" aria-selected="false" >
          Brand
        </a>
      </li>
    </ul>
  )
}
