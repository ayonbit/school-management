const currentWorkWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const startOfWeek = new Date(today);

  if (dayOfWeek === 0) {
    startOfWeek.setDate(today.getDate() - 6);
  } else if (dayOfWeek === 6) {
    startOfWeek.setDate(today.getDate() - 5);
  } else {
    startOfWeek.setDate(today.getDate() - (dayOfWeek - 1));
  }

  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

export const adjustScheduleToCurrentWeek = (lessons) => {
  if (!lessons || lessons.length === 0) {
    console.warn("No valid lessons provided to adjustScheduleToCurrentWeek");
    return [];
  }

  const startOfWeek = currentWorkWeek();

  return lessons
    .map((lesson, index) => {
      if (!lesson || !lesson.title || !lesson.start || !lesson.end) {
        console.warn(`Skipping invalid lesson at index ${index}:`, lesson);
        return null;
      }

      const lessonStart = new Date(lesson.start);
      const lessonsDayOfWeek = lessonStart.getDay();
      const daysFromMonday = lessonsDayOfWeek === 0 ? 6 : lessonsDayOfWeek - 1;

      const adjustedStartDate = new Date(startOfWeek);
      adjustedStartDate.setDate(startOfWeek.getDate() + daysFromMonday);
      adjustedStartDate.setHours(
        lessonStart.getHours(),
        lessonStart.getMinutes(),
        lessonStart.getSeconds()
      );

      const lessonEnd = new Date(lesson.end);
      const adjustedEndDate = new Date(adjustedStartDate);
      adjustedEndDate.setHours(
        lessonEnd.getHours(),
        lessonEnd.getMinutes(),
        lessonEnd.getSeconds()
      );

      return {
        title: lesson.title,
        start: adjustedStartDate,
        end: adjustedEndDate,
      };
    })
    .filter(Boolean);
};
