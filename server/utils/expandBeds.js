export default function expandBeds(beds) {
  return beds.flatMap(bed => {
    const [quantity, size] = bed.split("x ");
    return Array(parseInt(quantity)).fill(size);
  });
}
