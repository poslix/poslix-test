import styles from '../styles.module.css';

export default function MainLabel(props) {
  const { htmlFor, children, ..._props } = props;
  return (
    <label htmlFor={htmlFor} className={styles.label} {..._props}>
      {children}
    </label>
  );
}
