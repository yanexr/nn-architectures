import type { SVGProps } from "react";

/*
 * The nn mark (the same mark the nn-diagram editor uses): four filled paths,
 * no masks or clipped strokes, so it renders crisply at any size.
 */
const RING =
  "M93.5 69.5C93.5 93.2482 74.2482 112.5 50.5 112.5C26.7518 112.5 7.5 93.2482 7.5 69.5C7.5 45.7518 26.7518 26.5 50.5 26.5C74.2482 26.5 93.5 45.7518 93.5 69.5Z";
const LEFT =
  "M0 159C0 137.461 17.4609 120 39 120H99V234H39C17.4609 234 0 216.539 0 195ZM84 135H39C25.745 135 15 145.745 15 159V195C15 208.255 25.745 219 39 219H84Z";
const RIGHT =
  "M162 120H252V201C252 219.225 237.225 234 219 234H191C174.984 234 162 221.016 162 205ZM177 135V205C177 212.732 183.268 219 191 219H219C228.941 219 237 210.941 237 201V135Z";
const ARCH =
  "M213 19C234.539 19 252 36.4609 252 58V120H237V58C237 44.7452 226.255 34 213 34H148C134.571 34 123.075 42.2731 118.328 54H123C151.817 54 175.36 76.5721 176.917 105H177V120H162V108C162 86.4609 144.539 69 123 69H101V66C101 40.0426 122.043 19 148 19H213Z";

/** The nn mark in currentColor, so it follows the text color. */
export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 252 252" fill="currentColor" fillRule="evenodd" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d={RING} fill="none" stroke="currentColor" strokeWidth="15" />
      <path d={LEFT} />
      <path d={RIGHT} />
      <path d={ARCH} />
    </svg>
  );
}
