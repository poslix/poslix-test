export const colourStyles = {
  control: (style: any, state: any) => ({
    ...style,
    borderRadius: '10px',
    background: '#f5f5f5',
    height: '50px',
    borderColor: state.isFocused ? '2px solid #045c54' : '#eaeaea',
    boxShadow: 'none',
    '&:hover': {
      border: '2px solid #045c54 ',
    },
  }),
  menu: (provided: any, state: any) => ({
    ...provided,
    borderRadius: '10px',
    padding: '10px',
    border: '1px solid #c9ced2',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#e6efee' : 'white',
    color: '#2e776f',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: '#e6efee',
      color: '#2e776f',
      borderRadius: '10px',
    },
  }),
};
