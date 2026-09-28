-- CreateTable
CREATE TABLE "examples" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_date" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "examples_pkey" PRIMARY KEY ("id")
);

