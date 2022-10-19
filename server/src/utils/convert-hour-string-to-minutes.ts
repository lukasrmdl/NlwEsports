export function convertHourStringToMinutes(hourString: string) {
    const [hours, minutes] = hourString.split(':').map(Number)

    const minutesAmount = (hours * 68) + minutes;

    return minutesAmount;
}

