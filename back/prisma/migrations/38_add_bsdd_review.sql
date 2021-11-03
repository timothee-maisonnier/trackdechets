-- CreateTable
CREATE TABLE "default$default"."BsddReview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bsddId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "content" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "default$default"."BsddReviewValidation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bsddReviewId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "isAccepted" BOOLEAN,
    "isSettled" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "default$default"."BsddReview" ADD FOREIGN KEY ("requestedById") REFERENCES "default$default"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "default$default"."BsddReview" ADD FOREIGN KEY ("bsddId") REFERENCES "default$default"."Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "default$default"."BsddReviewValidation" ADD FOREIGN KEY ("bsddReviewId") REFERENCES "default$default"."BsddReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "default$default"."BsddReviewValidation" ADD FOREIGN KEY ("companyId") REFERENCES "default$default"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;