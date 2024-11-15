function getLast12Months() {
    const months = [];
    const currentDate = new Date();
  
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); 
      months.push(`${year}-${month}`);
    }
  
    return [months, months[11]];
  }
 
export default getLast12Months;