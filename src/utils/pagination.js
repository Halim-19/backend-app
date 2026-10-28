// Turn page/limit into the skip/take values Prisma expects
export const getPagination = ({ page, limit }) => ({
  skip: (page - 1) * limit,
  take: limit,
});

// Build the "meta" block that goes in every list response
export const buildMeta = ({ page, limit, total }) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};